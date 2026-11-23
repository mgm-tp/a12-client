// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
