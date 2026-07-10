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

import type { Middleware, Reducer, Store } from "redux";

import { actionCreatorFactory } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";
import type { Locale } from "@com.mgmtp.a12.utils/utils-localization";

import type { ActivityMap } from "../../core/activity/internal/activityMap.js";
import {
	ApplicationFactories,
	ModuleTestExtensions,
	type A12ApplicationConfig
} from "../../core/application/index.js";
import type { ApplicationState } from "../../core/application/internal/reducers.js";
import type { DataHandler } from "../../core/data/index.js";
import type { ApplicationModel } from "../../core/model/index.js";
import type { ModelState } from "../../core/model/internal/ModelState.js";
import type { Notification } from "../../core/notification/index.js";
import { DirtyHandlingFactories } from "../../extensions/dirtyHandling/index.js";

import { newFileSystemModelLoader } from "../mocks/ModelLoader.js";
import { singleDocumentDataLoaderMock } from "../mocks/application/singleDocumentDataLoaderMock.js";

import { createAppModel } from "./appmodel-utils.js";
import type { WaitForFunc } from "./helpers/waitFor.js";
import { waitForWithStore } from "./helpers/waitFor.js";

/**
 * Utility interface to prevent missing property definitions.
 */
export interface ClientState {
	readonly models: ModelState;
	readonly activities: ActivityMap;
	readonly locale: Locale;
	readonly application: ApplicationState;
	readonly notifications: Notification[];
}

export interface Config {
	readonly appModel?: ApplicationModel;
	readonly withDirtyHandling?: boolean;
	readonly locale?: Locale;
	readonly additionalMiddlewares?: Middleware[];
	readonly initialState?: Partial<ClientState>;
	readonly dataHandlers?: DataHandler[];
}

const factory = actionCreatorFactory("Test");
const setInitialState = factory<Partial<ClientState>>("SET_INITIAL_STATE");

export function createApplicationSetup({
	withDirtyHandling,
	appModel,
	locale,
	additionalMiddlewares,
	initialState,
	dataHandlers
}: Config = {}): {
	readonly store: Store<ClientState>;
	readonly waitFor: WaitForFunc;
} {
	/**
	 * This is important!
	 * Otherwise the deep-linking feature can mess with tests!
	 */
	location.hash = "";

	ModuleTestExtensions.reset();

	const rootReducer: (defaultReducer: Reducer<object>) => Reducer<object> =
		defaultReducer => (state, action) => {
			return setInitialState.match(action)
				? { ...state, ...action.payload }
				: defaultReducer(state, action);
		};

	const { store } = ApplicationFactories.createApplicationSetup({
		model: appModel ?? createAppModel(),
		modelLoader: newFileSystemModelLoader,
		dataHandlers: dataHandlers ?? [singleDocumentDataLoaderMock],
		overridePlatformSagas: withDirtyHandling ? DirtyHandlingFactories.createSagas() : [],
		additionalMiddlewares,
		customSagas: [],
		dataReducers: [],
		rootReducer,
		locale,
		setupActions: initialState ? [setInitialState(initialState)] : undefined
	});

	return {
		store: store as Store<ClientState>,
		waitFor: waitForWithStore(store)
	};
}

const defaultConfig: A12ApplicationConfig = {
	config: {},
	localization: {
		supportedLocales: []
	}
};

type MergeWithDefaults<T> = T & Omit<A12ApplicationConfig, keyof T>;

/**
 * This function exists, because extensions share the same ts project, so each extensions pollutes the 'A12ApplicationConfig'
 * type via module augmentation with required properties, that are not required by the test.
 */
export function toA12Config<T extends Partial<A12ApplicationConfig>>(
	partialConfig: T
): MergeWithDefaults<T> {
	return { ...defaultConfig, ...partialConfig };
}
