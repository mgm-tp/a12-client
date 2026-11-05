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

/*
 * This is the top-level application composition root. It lives in `frame`
 * (the highest layer) because it wires the concrete frame defaults
 * (`FrameFactories`, `DynamicRegionUi`) into the application setup. Placing it
 * here keeps the layering `frame -> application` intact: `application` no longer
 * needs to reach "up" into `frame`. See A12C-3300.
 *
 * `createA12ApplicationSetup` is re-exported from `frame/index.ts`, which the
 * package barrel (`src/core/index.ts`) re-exports, so the public import path is
 * unchanged for consumers.
 */

import { Fragment, type ReactElement } from "react";
import type { Store } from "redux";

import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging";

import type {
	A12ApplicationConfig,
	ViewModification
} from "../../application/internal/factories/applicationConfig.js";
import { ApplicationFactories } from "../../application/internal/factories/index.js";
import { ModuleRegistryProvider } from "../../application/internal/factories/moduleRegistryProvider.js";
import type { ApplicationModel } from "../../model/internal/ApplicationModel.js";
import type { View } from "../../view/internal/view.js";

import { FrameFactories } from "./factories.js";
import type { Layout } from "./layout/LayoutProps.js";
import type { LayoutModification } from "./layoutConfig.js";
import { DynamicRegionUi } from "./layoutNG/DynamicRegionUi.js";

const logger = LoggerFactory.getLogger("core/frame");

const isDevelopment = process.env.NODE_ENV === "development";

const DEFAULT_ROOT_REGION_REF: ApplicationModel.Region.Reference = [];

/**
 * @experimental
 *
 * The entry point for the A12 application setup. Returns the Redux store, a function that you should call
 * to initialize the application and a React Component that you should render.
 */
export function createA12ApplicationSetup(
	appConfig: A12ApplicationConfig<ApplicationFactories.Config>
) {
	const { store } = ApplicationFactories.createApplicationSetup(appConfig.config);

	return {
		store,
		initialActions: () => appConfig.initialActions?.(store) ?? Promise.resolve(),
		Component: createRootRegion(appConfig, store)
	};
}

/**
 * Applies each modification once to the base view registered under its name (via `addView` or a built-in
 * default). A modification whose name matches no base view has no effect (and, in development, logs a
 * warning), since it can never be applied later either - views resolved dynamically from the module
 * registry at render time are not covered by this fold.
 *
 * @internal
 */
export function foldViewModifications(
	views: Readonly<Record<string, View.ViewComponent>>,
	modifications: readonly ViewModification[]
): Readonly<Record<string, View.ViewComponent>> {
	return modifications.reduce((current, { name, modify }) => {
		const base = current[name] ?? FrameFactories.viewProvider(name);
		if (base === undefined) {
			warnUnmatchedModification("view", name);
			return current;
		}
		return { ...current, [name]: modify(base) };
	}, views);
}

/**
 * Applies each modification once to the base layout registered under its name (via `addLayout` or a
 * built-in default). A modification whose name matches no base layout has no effect (and, in development,
 * logs a warning).
 *
 * @internal
 */
export function foldLayoutModifications(
	layouts: Readonly<Record<string, Layout>>,
	modifications: readonly LayoutModification[]
): Readonly<Record<string, Layout>> {
	return modifications.reduce((current, { name, modify }) => {
		const base = current[name] ?? tryGetBuiltinLayout(name);
		if (base === undefined) {
			warnUnmatchedModification("layout", name);
			return current;
		}
		return { ...current, [name]: modify(base) };
	}, layouts);
}

function tryGetBuiltinLayout(name: string): Layout | undefined {
	try {
		return FrameFactories.layoutProvider(name);
	} catch {
		return undefined;
	}
}

function warnUnmatchedModification(kind: "view" | "layout", name: string): void {
	if (isDevelopment) {
		logger.warn(
			`Registered a ${kind} modification for "${name}", but no matching ${kind} was found - it will have no effect.`
		);
	}
}

/**
 * Renders the root region element for the application: either the dynamic-config
 * region, or the app-model region wired up with the providers from `appConfig`
 * falling back to the `frame` defaults. Returns an element, not a component.
 */
function createRootRegion(appConfig: A12ApplicationConfig, store: Store) {
	const rootRegionRef = appConfig.config.rootRegionRef ?? DEFAULT_ROOT_REGION_REF;
	const Wrapper = appConfig.config.WrapperComponent ?? Fragment;

	const views = foldViewModifications(
		appConfig.config.views ?? {},
		appConfig.config.viewModifications ?? []
	);
	const layouts = foldLayoutModifications(
		appConfig.config.layouts ?? {},
		appConfig.config.layoutModifications ?? []
	);
	const RegionUi = FrameFactories.regionUiProvider(rootRegionRef);

	function viewProvider(name: string): View.ViewComponent {
		const fallback = (name: string) =>
			views[name] ?? FrameFactories.viewProvider(name) ?? Placeholder;
		return ModuleRegistryProvider.getViewProvider(store.getState(), fallback)(name);
	}

	function layoutProvider(name: string): Layout {
		return layouts[name] ?? FrameFactories.layoutProvider(name);
	}

	function regionProvider(regionRef: ApplicationModel.Region.Reference) {
		return appConfig.config.regions?.(regionRef) ?? FrameFactories.regionUiProvider(regionRef);
	}

	function progressComponentProvider(
		regionReference: ApplicationModel.Region.Reference,
		viewName: string
	) {
		return (
			appConfig.config.progressIndicators?.(regionReference, viewName) ??
			FrameFactories.createProgressComponentProvider()(regionReference, viewName)
		);
	}

	function errorBoundaryProvider(
		regionReference: ApplicationModel.Region.Reference,
		viewName: string
	) {
		return (
			appConfig.config.errorBoundaries?.(regionReference, viewName) ??
			FrameFactories.errorBoundaryProvider()
		);
	}

	return (
		<Wrapper>
			{appConfig.config.dynamicConfig ? (
				<DynamicRegionUi regionRef={rootRegionRef.join("/")} />
			) : (
				<RegionUi
					key="region"
					regionReference={rootRegionRef}
					layoutProvider={layoutProvider}
					regionUiProvider={regionProvider}
					viewProvider={viewProvider}
					progressComponentProvider={progressComponentProvider}
					errorBoundaryProvider={errorBoundaryProvider}
				/>
			)}
		</Wrapper>
	);
}

/**
 * Fallback in the case that no view provider has been defined to handle a specific view.
 */
function Placeholder(props: View): ReactElement {
	if (!isDevelopment) {
		throw new Error(`No view renderer found: '${props.name}'`);
	}
	return <div>No view renderer found: `{props.name}`</div>;
}
