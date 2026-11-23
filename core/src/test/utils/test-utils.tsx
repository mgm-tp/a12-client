// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Middleware, Reducer, Store } from "redux";

import type { Locale } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";

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

import { singleDocumentDataLoaderMock } from "../mocks/application/singleDocumentDataLoaderMock.js";
import { newFileSystemModelLoader } from "../mocks/ModelLoader.js";

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

const SET_INITIAL_STATE_ACTION_TYPE = "SET_INITIAL_STATE";

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
			return action.type === SET_INITIAL_STATE_ACTION_TYPE
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
		setupActions: initialState
			? [{ type: SET_INITIAL_STATE_ACTION_TYPE, payload: initialState }]
			: undefined
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
