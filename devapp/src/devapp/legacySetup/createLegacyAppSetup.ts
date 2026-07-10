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

import type { Middleware, Reducer } from "redux";

import type { ActivityReducers, ApplicationModel } from "@com.mgmtp.a12.client/client-core";
import { ApplicationFactories, ModuleRegistryProvider } from "@com.mgmtp.a12.client/client-core";
import { DeepLinkingFactories } from "@com.mgmtp.a12.client/client-core/deepLinking";
import { DirtyHandlingFactories } from "@com.mgmtp.a12.client/client-core/dirtyHandling";
import { DataServicesReducerMap } from "@com.mgmtp.a12.dataservices/dataservices-access";

import { createInitializationMiddleware, getModelLoader } from "../commonDevappSetup.js";
import { enableReduxDevTools } from "../config/enableReduxDevTools.js";
import { SimpleFormDataLoader } from "../mocks/SimpleForm/data-loader.js";
import { SimpleOverviewDataLoader } from "../mocks/SimpleOverview/data-loader.js";
import { initialization, resetApplication, resetRequested } from "../store/actions.js";
import { DevAppReducers } from "../store/reducer.js";

import appmodel from "./app_model.json" with { type: "json" };
import { LegacyModule } from "./modules.js";

export function createLegacyAppSetup() {
	ModuleRegistryProvider.getInstance().addModule(LegacyModule);

	const finalOverridePlatformSagas = [...DirtyHandlingFactories.createSagas()];

	const finalAdditionalMiddlewares: Middleware[] = [createInitializationMiddleware()];

	const dataReducers: ActivityReducers.DataReducer[] = [];
	const rootReducer = (defaultReducer: Reducer<object>) =>
		DevAppReducers.SetCaseReducer(defaultReducer);

	return ApplicationFactories.createApplicationSetup({
		model: appmodel as ApplicationModel,
		modelLoader: getModelLoader(),
		dataHandlers: [new SimpleOverviewDataLoader(), new SimpleFormDataLoader()],
		overridePlatformSagas: finalOverridePlatformSagas,
		additionalMiddlewares: finalAdditionalMiddlewares,
		customSagas: DeepLinkingFactories.createSagas({
			applyTriggers: [initialization.done],
			clearTriggers: [resetApplication]
		}),
		composeEnhancer: enableReduxDevTools(),
		reducerMap: {
			counter: DevAppReducers.counter,
			...DataServicesReducerMap
		},
		dataReducers,
		rootReducer,
		applicationBusyTriggers: {
			start: [initialization.started],
			end: [initialization.done, initialization.failed]
		},
		applicationResetTriggers: {
			resetRequested: [resetRequested],
			resetConfirmed: resetApplication(),
			reset: [resetApplication]
		}
	});
}
