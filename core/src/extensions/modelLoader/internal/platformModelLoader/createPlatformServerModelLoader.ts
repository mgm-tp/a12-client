// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ModelLoader } from "../../../../core/model/index.js";

import { GenericModelLoader } from "../GenericModelLoader.js";
import type { GenericModelLoaderOptions } from "../genericModelLoaderOptions.js";

import { platformServerModelFetcher } from "./platformServerModelFetcher.js";

export interface PlatformServerModelLoaderOptions extends GenericModelLoaderOptions {}

/**
 * Configure the model loader to retrieve models from a Data Services server or an alternative implementation.
 *
 * *IMPORTANT:*
 * This extension relays on a complete configured `ConnectorLocator`.
 */
export function createPlatformServerModelLoader({
	modelProcessors,
	supportedModelVersions
}: PlatformServerModelLoaderOptions = {}): ModelLoader {
	return new GenericModelLoader(
		platformServerModelFetcher,
		modelProcessors,
		supportedModelVersions
	);
}
