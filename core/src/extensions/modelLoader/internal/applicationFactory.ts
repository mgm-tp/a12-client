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

import type {
	A12ApplicationConfig,
	ApplicationWithConfiguredFeature,
	ApplicationWithConfiguredModelLoader,
	RequireFeatures
} from "../../../core/application/internal/factories/applicationConfig.js";
import {
	setConfigured,
	withModelLoader
} from "../../../core/application/internal/factories/applicationFactory.js";
import type { ModelProcessor } from "../../../core/model/internal/ModelProcessor.js";

import type { GenericModelLoaderOptions } from "./genericModelLoaderOptions.js";
import { createHttpModelLoader } from "./httpModelLoader/createHttpModelLoader.js";
import { createPlatformServerModelLoader } from "./platformModelLoader/createPlatformServerModelLoader.js";

declare module "../../../core/application/internal/factories/applicationConfig.js" {
	interface A12ApplicationConfig {
		modelLoader?: GenericModelLoaderOptions;
	}
}

/**
 * @experimental
 */
export type ApplicationWithModelLoaderConfig = RequireFeatures<
	A12ApplicationConfig,
	{ modelLoader?: never }
>;

/**
 * @experimental
 */
export const addModelProcessors =
	<T extends ApplicationWithModelLoaderConfig>(...processors: ModelProcessor[]) =>
	(cfg: T): T => {
		return {
			...cfg,
			modelLoader: {
				...cfg.modelLoader,
				modelProcessors: [...(cfg.modelLoader?.modelProcessors ?? []), ...processors]
			}
		};
	};

/**
 * @experimental
 */
export const addSupportedModelVersion =
	(type: string, versionRange: string) =>
	<T extends ApplicationWithModelLoaderConfig>(cfg: T): T => {
		const supportedModelVersions = {
			...cfg.modelLoader?.supportedModelVersions,
			[type]: versionRange
		};
		return {
			...cfg,
			modelLoader: {
				...cfg.modelLoader,
				supportedModelVersions
			}
		};
	};

/**
 * @experimental
 */
export const withPlatformModelLoader = <T extends ApplicationWithModelLoaderConfig>(
	cfg: T
): ApplicationWithConfiguredFeature<ApplicationWithConfiguredModelLoader<T>, "modelLoader"> =>
	setConfigured<ApplicationWithConfiguredModelLoader<T>, "modelLoader">("modelLoader")(
		withModelLoader<T>(createPlatformServerModelLoader(cfg.modelLoader))(cfg)
	);

/**
 * @experimental
 */
export const withHTTPModelLoader = <T extends ApplicationWithModelLoaderConfig>(
	cfg: T
): ApplicationWithConfiguredFeature<ApplicationWithConfiguredModelLoader<T>, "modelLoader"> =>
	setConfigured<ApplicationWithConfiguredModelLoader<T>, "modelLoader">("modelLoader")(
		withModelLoader<T>(createHttpModelLoader(cfg.modelLoader))(cfg)
	);
