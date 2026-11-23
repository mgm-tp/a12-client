// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ModelLoader } from "../../../../core/model/index.js";

import { GenericModelLoader } from "../GenericModelLoader.js";
import type { GenericModelLoaderOptions } from "../genericModelLoaderOptions.js";

import { createHttpModelFetcher } from "./createHttpModelFetcher.js";

export interface HttpModelLoaderOptions extends GenericModelLoaderOptions {
	/**
	 * The base path from which models should be loaded
	 *
	 * `"/"` will be used by default.
	 */
	readonly basePath?: string;
}

/**
 * Factory function that returns a model loader used to retrieve
 * different kinds of models from the given `basePath`.
 */
export function createHttpModelLoader(
	{ basePath, modelProcessors, supportedModelVersions }: HttpModelLoaderOptions = { basePath: "/" }
): ModelLoader {
	const fetcher = createHttpModelFetcher(basePath);
	return new GenericModelLoader(fetcher, modelProcessors, supportedModelVersions);
}
