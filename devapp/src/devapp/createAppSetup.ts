// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Middleware, Reducer } from "redux";

import type { ActivityReducers, ApplicationSaga } from "@com.mgmtp.a12.client/client-core";
import {
	ApplicationFactories,
	ModuleRegistryProvider,
	AppmodelToDynamicConfigurationAdapter,
	ModelActions,
	ModelSelectors,
	StoreActions
} from "@com.mgmtp.a12.client/client-core";
import { DirtyHandlingFactories } from "@com.mgmtp.a12.client/client-core/dirtyHandling";

import { isDevelopmentMode } from "./config/development.js";
import { enableReduxDevTools } from "./config/enableReduxDevTools.js";
import { DevModeModules } from "./modules/dev_mode/index.js";
import { SampleAppModules } from "./modules/modules.js";
import { NewLayoutsModule } from "./NewLayoutsModule.js";
import type { CustomSetup } from "./steps/factories.js";
import { StateHistoryFactory } from "./steps/factories.js";
import { StateHistoryMiddleware } from "./steps/middlewares.js";
import { DevAppActions } from "./store/actions.js";
import { DevAppReducers } from "./store/reducer.js";

export type CustomSetupConfig = Pick<
	ApplicationFactories.Config,
	| "model"
	| "modelLoader"
	| "customSagas"
	| "dataHandlers"
	| "setupActions"
	| "additionalMiddlewares"
	| "overridePlatformSagas"
	| "reducerMap"
>;

/**
 * NOTE: this function is also called from step tests and should therefore NOT
 * interact with web apis (e.g. window) directly.
 *
 * If this is unavoidable, add an undefined check.
 */
export function createAppSetupWithStateHistory({
	modelLoader,
	dataHandlers,
	additionalMiddlewares,
	overridePlatformSagas,
	customSagas,
	model,
	setupActions,
	reducerMap
}: CustomSetupConfig): CustomSetup {
	// appmodel -> DynamicConfiguration
	ModuleRegistryProvider.getInstance().addModule(AppmodelToDynamicConfigurationAdapter);

	// ensure that the "new layouts" are used
	ModuleRegistryProvider.getInstance().addModule(NewLayoutsModule);

	const stateHistory = StateHistoryFactory.createStateHistory();

	if (isDevelopmentMode()) {
		DevModeModules.forEach(m => {
			ModuleRegistryProvider.getInstance().addModule(m);
		});
	}

	const moduleDataLoaders = SampleAppModules.map(mod => mod.dataLoaders || []).reduce(
		(prev, cur) => prev.concat(cur),
		[]
	);

	const devModeModuleDataLoaders = isDevelopmentMode()
		? DevModeModules.map(mod => mod.dataLoaders || []).reduce((prev, cur) => prev.concat(cur), [])
		: [];

	const extendedDataHandlers = [
		...moduleDataLoaders,
		...devModeModuleDataLoaders,
		...(dataHandlers ?? [])
	];

	const applicationSagaConfig: ApplicationSaga.Configuration = {
		dataHandlers: extendedDataHandlers
	};

	const modulePlatformSagas = SampleAppModules.flatMap(mod => mod.applicationSagas ?? []).map(
		saga => saga(applicationSagaConfig)
	);

	const finalOverridePlatformSagas = [
		...(overridePlatformSagas ?? []),
		...modulePlatformSagas,
		...DirtyHandlingFactories.createSagas()
	];

	const finalAdditionalMiddlewares: Middleware[] = [
		api => next => action => {
			let result;
			// Middleware to simulate a async process to test the deep linking apply saga
			if (DevAppActions.initialization.started.match(action)) {
				setTimeout(() => {
					// Set deep link for the welcome page if none exists
					// The deep link saga triggered afterwards will apply it and push the activity
					if (location.hash.replace(/^#/, "") === "") {
						location.hash = "section:welcome";
					}

					api.dispatch(DevAppActions.initialization.done({}));
				}, 0);
			} else if (StoreActions.resetState.match(action)) {
				// Preserve modelGraph for devapp on reset
				const modelGraph = ModelSelectors.modelGraph()(api.getState());
				result = next(action);
				api.dispatch(ModelActions.setModelGraph(modelGraph));
			}

			return result ?? next(action);
		},
		...(additionalMiddlewares ?? []),
		StateHistoryMiddleware.recorder(stateHistory)
	];

	SampleAppModules.forEach(m => {
		ModuleRegistryProvider.getInstance().addModule(m);
	});

	const dataReducers: ActivityReducers.DataReducer[] = [];
	const rootReducer = (defaultReducer: Reducer<object>) =>
		DevAppReducers.SetCaseReducer(defaultReducer);

	const config = ApplicationFactories.createApplicationSetup({
		model,
		modelLoader,
		dataHandlers: extendedDataHandlers,
		overridePlatformSagas: finalOverridePlatformSagas,
		additionalMiddlewares: finalAdditionalMiddlewares,
		customSagas,
		setupActions,
		composeEnhancer: enableReduxDevTools(),
		reducerMap: {
			counter: DevAppReducers.counter,
			...reducerMap
		},
		dataReducers,
		rootReducer,
		applicationBusyTriggers: {
			start: [DevAppActions.initialization.started],
			end: [DevAppActions.initialization.done, DevAppActions.initialization.failed]
		},
		applicationResetTriggers: {
			resetRequested: [DevAppActions.ResetApplication.resetRequested],
			resetConfirmed: DevAppActions.ResetApplication.resetApplication(),
			reset: [DevAppActions.ResetApplication.resetApplication]
		}
	});

	return {
		...config,
		stateHistory
	};
}
