// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
