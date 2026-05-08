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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

/**
 * This package contains modules for setting up a Client based application,
 * for aggregation of sub module functions on application level and for the
 * asynchronous handlers called 'platform sagas'.
 *
 * @packageDocumentation
 */
export { ApplicationActions } from "./internal/actions.js";
export { AppModelAdapterModule } from "./internal/adapter/appModelAdapterModule.js";
export type {
	A12ApplicationConfig,
	ApplicationWithConfiguredFeature,
	ApplicationWithConfiguredModel,
	ApplicationWithConfiguredModelLoader,
	BaseConfig,
	RequireFeatures
} from "./internal/factories/applicationConfig.js";
export {
	addAdditionalMiddlewares,
	addApplicationBusyTriggers,
	addComposeEnhancer,
	addCustomSagas,
	addDataHandlers,
	addDataReducers,
	addErrorBoundary,
	addInitialAction,
	addLayout,
	addPlatformSagas,
	addProgressIndicator,
	addReduxSetupAction,
	addRegion,
	addRootReducer,
	addView,
	addWrapper,
	combineFeatures,
	createA12ApplicationSetup,
	modifyLayout,
	modifyView,
	setConfigured,
	withApplicationResetTriggers,
	withDynamicConfig,
	withModel,
	withModelLoader,
	withReducerMap
} from "./internal/factories/applicationFactory.js";
export { ApplicationFactories } from "./internal/factories/index.js";
export type { ApplicationSetup, ComposeEnhancer } from "./internal/factories/index.js";
export type { ModuleRegistry } from "./internal/factories/moduleRegistry.js";
export { ModuleTestExtensions } from "./internal/factories/moduleRegistryInstance.js";
export { ModuleRegistryProvider } from "./internal/factories/moduleRegistryProvider.js";
export type { InternalSlices, ReducerMap, Slices } from "./internal/factories/reducerMap.js";
export { ApplicationReducers } from "./internal/reducers.js";
export type { ApplicationSaga } from "./internal/sagas/ApplicationSaga.js";
export { ApplicationSelectors } from "./internal/selectors.js";

export type { Module } from "./internal/factories/module.js";

/** Constant value to identify new empty document instances */
export const NEW_INSTANCE_IDENTIFIER = "__NEW__";

export { ApplicationLenses } from "./internal/application-lenses.js";
