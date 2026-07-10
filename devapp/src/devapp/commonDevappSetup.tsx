/*
 * SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
 *
 * Copyright (c) 2012-2026 mgm technology partners GmbH
 *
 * Dual License
 * ------------
 * This source file is part of the mgm A12 Platform and available under
 * a choice of two different licenses:
 *
 * 1. Open-Source License - EUPL v1.2
 *    You may redistribute and/or modify this file under the terms of the
 *    European Union Public License, version 1.2 - see https://eupl.eu/.
 *
 * 2. Commercial License
 *    Alternatively, you may obtain a commercial license from
 *    mgm technology partners GmbH, that permits use of this software
 *    under different terms (including support and maintenance services).
 *
 *    Please contact a12-license@mgm-tp.com for more information.
 *
 * You must select and comply with exactly one of the above license options.
 *
 * Warranty Disclaimer (applies to either option)
 * ----------------------------------------------
 * THIS SOFTWARE IS PROVIDED "AS IS" AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import type { JSX, PropsWithChildren } from "react";
import { StrictMode, useContext } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useSelector } from "react-redux";
import type { Action, Middleware, Store } from "redux";

import type { FrameViews } from "@com.mgmtp.a12.client/client-core";
import {
	ActivitySelectors,
	ApplicationSelectors,
	FrameFactories,
	LayoutProvidersContext,
	ModelActions,
	ModelSelectors,
	StoreActions,
	ViewViews
} from "@com.mgmtp.a12.client/client-core";
import {
	createHttpModelLoader,
	createPlatformServerModelLoader
} from "@com.mgmtp.a12.client/client-core/modelLoader";
import { Settings } from "@com.mgmtp.a12.utils/utils-logging";

import { DevAppContext } from "./components/devAppContext.js";
import { DynamicConsoleLoggingStrategy } from "./config/loggingStrategy.js";
import { isPlatformServerProfile } from "./mocks/utils.js";
import { createProgressComponentProvider } from "./provider/progressComponentProvider.js";
import { ThemeContextProvider } from "./provider/themeProvider.js";
import { createViewProvider } from "./provider/viewProvider.js";
import { initialization } from "./store/actions.js";

export function triggerDialogForDirtyOrLockedActivities(store: Store<object, Action>) {
	/*
	 * Listen to the window.onbeforeunload event to trigger a dialog
	 * if there are dirty or locked activities when the application gets closed.
	 */
	window.onbeforeunload = event => {
		const dirtySubTree = ActivitySelectors.allDirtyOrLockedActivities()(store.getState());
		if (dirtySubTree.length > 0) {
			event.preventDefault();
		}
	};
}

export function createInitializationMiddleware(): Middleware {
	return api => next => action => {
		let result;
		// Middleware to simulate an async process to test deep linking apply saga
		if (initialization.started.match(action)) {
			setTimeout(() => {
				// Set deep link for the welcome page if none exists
				if (typeof location !== "undefined" && location.hash.replace(/^#/, "") === "") {
					location.hash = "section:welcome";
				}

				api.dispatch(initialization.done({}));
			}, 0);
		} else if (StoreActions.resetState.match(action)) {
			// Preserve modelGraph for devapp on reset
			const modelGraph = ModelSelectors.modelGraph()(api.getState());
			result = next(action);
			api.dispatch(ModelActions.setModelGraph(modelGraph));
		}

		return result ?? next(action);
	};
}

/**
 * Checks the current profile and returns either the PlatformServerModelLoader, which requires a running backend
 * or the HttpModelLoader
 */
export function getModelLoader() {
	return isPlatformServerProfile() ? createPlatformServerModelLoader() : createHttpModelLoader();
}

export function renderDevApp(store: Store<object, Action>, devappComponent: JSX.Element) {
	Settings.LogStrategy = new DynamicConsoleLoggingStrategy();

	const mountPoint = document.getElementById("root") as HTMLDivElement;
	const root = createRoot(mountPoint);

	root.render(
		<StrictMode>
			<Provider store={store}>
				<DevAppContext.Provider value={createViewProvider(store)}>
					<ThemeContextProvider>
						<GeneralPageWrapper>{devappComponent}</GeneralPageWrapper>
					</ThemeContextProvider>
				</DevAppContext.Provider>
			</Provider>
		</StrictMode>
	);
}

const progressComponentProvider = createProgressComponentProvider(500);

function GeneralPageWrapper(props: PropsWithChildren): JSX.Element {
	const viewProvider = useContext(DevAppContext);
	const busy = useSelector(ApplicationSelectors.busy());

	const layoutProviders: FrameViews.ProviderProps = {
		layoutProvider: FrameFactories.layoutProvider,
		regionUiProvider: FrameFactories.regionUiProvider,
		viewProvider,
		progressComponentProvider
	};

	return (
		<LayoutProvidersContext.Provider value={layoutProviders}>
			<ViewViews.ProgressIndicator progress={busy ? "loading" : "none"} global>
				{props.children}
			</ViewViews.ProgressIndicator>
		</LayoutProvidersContext.Provider>
	);
}
