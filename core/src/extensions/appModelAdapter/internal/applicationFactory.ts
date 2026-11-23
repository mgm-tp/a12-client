// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { AppModelAdapterModule } from "../../../core/application/internal/adapter/appModelAdapterModule.js";
import type {
	A12ApplicationConfig,
	ApplicationWithConfiguredModel,
	RequireFeatures
} from "../../../core/application/internal/factories/applicationConfig.js";
import {
	addInitialAction,
	combineFeatures,
	setConfigured,
	withModel
} from "../../../core/application/internal/factories/applicationFactory.js";
import { ModuleRegistryProvider } from "../../../core/application/internal/factories/moduleRegistryProvider.js";
import { APPLICATION_MODEL_PLACEHOLDER } from "../../../core/model/internal/appModelPlaceholder.js";
import { addSupportedModelVersion } from "../../modelLoader/internal/applicationFactory.js";

const MODEL_TYPE = "application";
const SUPPORTED_MODEL_VERSIONS = "6.0";

declare module "../../../core/application/internal/factories/applicationConfig.js" {
	interface A12ApplicationConfig {
		appModelAdapter?: unknown;
	}
}

/**
 * @experimental
 */
export type ApplicationWithAppModelAdapterConfig = RequireFeatures<
	A12ApplicationConfig,
	{ appModelAdapter?: never; modelLoader?: never }
>;

/**
 * @experimental
 */
export const withAppModelDummy = <T extends ApplicationWithAppModelAdapterConfig>(cfg: T) =>
	withModel<T>(APPLICATION_MODEL_PLACEHOLDER)(cfg);

/**
 * @experimental
 */
export const withAppModelModelSupport = <T extends ApplicationWithAppModelAdapterConfig>(cfg: T) =>
	addSupportedModelVersion(MODEL_TYPE, SUPPORTED_MODEL_VERSIONS)(cfg);

/**
 * @experimental
 */
export const withAppModelAdapterModule = <T extends ApplicationWithAppModelAdapterConfig>(cfg: T) =>
	addInitialAction<T>(() => {
		ModuleRegistryProvider.getInstance().addModule(AppModelAdapterModule);
	})(cfg);

/**
 * @experimental
 */
export const withAppModelAdapter = <T extends ApplicationWithAppModelAdapterConfig>(cfg: T) =>
	setConfigured<ApplicationWithConfiguredModel<T>, "appModelAdapter">("appModelAdapter")(
		combineFeatures(withAppModelAdapterModule, withAppModelModelSupport, withAppModelDummy)(cfg)
	);
