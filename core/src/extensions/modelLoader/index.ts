// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

export type { ModelFetcher, ModelFetcherResult } from "./internal/ModelFetcher.js";

export {
	createHttpModelLoader,
	type HttpModelLoaderOptions
} from "./internal/httpModelLoader/createHttpModelLoader.js";

export { createHttpModelFetcher } from "./internal/httpModelLoader/createHttpModelFetcher.js";

export {
	createPlatformServerModelLoader,
	type PlatformServerModelLoaderOptions
} from "./internal/platformModelLoader/createPlatformServerModelLoader.js";

export {
	addModelProcessors,
	addSupportedModelVersion,
	withHTTPModelLoader,
	withPlatformModelLoader,
	type ApplicationWithModelLoaderConfig
} from "./internal/applicationFactory.js";

export type { GenericModelLoaderOptions } from "./internal/genericModelLoaderOptions.js";
