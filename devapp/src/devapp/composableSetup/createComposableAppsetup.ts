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

import {
	type A12ApplicationConfig,
	APPLICATION_MODEL_PLACEHOLDER,
	type ApplicationSaga,
	type DataHandler,
	ModelActions,
	type ModelLoader,
	ModuleRegistryProvider,
	addAdditionalMiddlewares,
	addApplicationBusyTriggers,
	addComposeEnhancer,
	addDataHandlers,
	addInitialAction,
	addPlatformSagas,
	addRootReducer,
	addWrapper,
	combineFeatures,
	createA12ApplicationSetup,
	setApplicationResetTriggers,
	withDynamicConfig,
	withModel,
	withModelLoader,
	addReducerMap
} from "@com.mgmtp.a12.client/client-core";
import { withDeepLinking } from "@com.mgmtp.a12.client/client-core/deepLinking";
import { withDirtyHandling } from "@com.mgmtp.a12.client/client-core/dirtyHandling";
import { withLocalization } from "@com.mgmtp.a12.client/client-core/localization";

import { createInitializationMiddleware } from "../commonDevappSetup.js";
import { isDevelopmentMode } from "../config/development.js";
import { enableReduxDevTools } from "../config/enableReduxDevTools.js";
import { SAMPLE_APPLICATION_TRANSLATIONS } from "../config/resources.js";
import { MOCK_MODEL_GRAPH } from "../mocks/modelGraph/ModelGraph.js";
import { SimpleFormDataLoader } from "../mocks/SimpleForm/data-loader.js";
import { SimpleOverviewDataLoader } from "../mocks/SimpleOverview/data-loader.js";
import { isPlatformServerProfile } from "../mocks/utils.js";
import { DevModeModules } from "../modules/dev_mode/index.js";
import { SampleDynamicConfigModules } from "../modules/modules.js";
import { CustomNotificationFrame } from "../modules/ui_handling/notifications/CustomNotificationFrame.js";
import { setupServerConnection } from "../server-connection/setupServerConnection.js";
import { createStateHistory } from "../steps/factories.js";
import { stateHistoryRecorder } from "../steps/middlewares.js";
import { initialization, resetApplication, resetRequested } from "../store/actions.js";
import { DevAppReducers } from "../store/reducer.js";

import { DevappLayoutModule } from "./DevappLayoutModule.js";

// NOTE: this factory is also called from step tests and should therefore NOT interact with web apis (e.g. window) directly.
export function createComposableApplication(modelLoader: ModelLoader) {
	const dataHandlers = [
		...getModuleDataLoaders(),
		new SimpleOverviewDataLoader(),
		new SimpleFormDataLoader()
	];

	const platformSagas = createPlatformSagas(dataHandlers);

	const stateHistory = createStateHistory();

	handleModuleRegistrationBeforeSetup();

	const initialConfig: A12ApplicationConfig = {
		config: {},
		localization: {
			supportedLocales: [],
			translationSource: SAMPLE_APPLICATION_TRANSLATIONS
		},
		deepLinking: {
			config: {
				applyTriggers: [initialization.done],
				clearTriggers: [resetApplication]
			}
		}
	};

	return {
		...createA12ApplicationSetup(
			combineFeatures(
				// Model loading (document models only — no application model needed with dynamic config)
				combineFeatures(withModel(APPLICATION_MODEL_PLACEHOLDER), withModelLoader(modelLoader)),
				// Client extensions
				combineFeatures(withLocalization, withDirtyHandling, withDeepLinking, withDynamicConfig),
				// Redux setup
				combineFeatures(
					addReducerMap({ counter: DevAppReducers.counter }),
					addRootReducer(DevAppReducers.SetCaseReducer),
					addAdditionalMiddlewares(
						createInitializationMiddleware(),
						stateHistoryRecorder(stateHistory)
					),
					addComposeEnhancer(enableReduxDevTools())
				),
				// Data handling & sagas
				combineFeatures(addPlatformSagas(...platformSagas), addDataHandlers(...dataHandlers)),
				// Application lifecycle triggers
				combineFeatures(
					addApplicationBusyTriggers({
						start: [initialization.started],
						end: [initialization.done, initialization.failed]
					}),
					setApplicationResetTriggers({
						resetRequested: [resetRequested],
						resetConfirmed: resetApplication(),
						reset: [resetApplication]
					})
				),
				// Initialization
				addInitialAction(async store => {
					store.dispatch(initialization.started());
					if (isPlatformServerProfile()) {
						await setupServerConnection(store);
					} else {
						store.dispatch(ModelActions.setModelGraph(MOCK_MODEL_GRAPH));
					}
				}),
				addWrapper(CustomNotificationFrame)
			)(initialConfig)
		),
		stateHistory
	};
}

function handleModuleRegistrationBeforeSetup() {
	SampleDynamicConfigModules.forEach(m => {
		ModuleRegistryProvider.getInstance().addModule(m);
	});

	ModuleRegistryProvider.getInstance().addModule(DevappLayoutModule);

	if (isDevelopmentMode()) {
		DevModeModules.forEach(m => {
			ModuleRegistryProvider.getInstance().addModule(m);
		});
	}
}

function getModuleDataLoaders(additionalDataHandlers: DataHandler[] = []) {
	const moduleDataLoaders = SampleDynamicConfigModules.flatMap(mod => mod.dataLoaders ?? []);

	const devModeModuleDataLoaders = isDevelopmentMode()
		? DevModeModules.flatMap(mod => mod.dataLoaders ?? [])
		: [];

	return [...moduleDataLoaders, ...devModeModuleDataLoaders, ...additionalDataHandlers];
}

function createPlatformSagas(dataHandlers: DataHandler[]): ApplicationSaga.Descriptor[] {
	const applicationSagaConfig: ApplicationSaga.Configuration = {
		dataHandlers
	};

	return SampleDynamicConfigModules.flatMap(mod => mod.applicationSagas ?? []).map(saga =>
		saga(applicationSagaConfig)
	);
}
