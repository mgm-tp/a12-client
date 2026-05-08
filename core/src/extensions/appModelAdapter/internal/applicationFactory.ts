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
