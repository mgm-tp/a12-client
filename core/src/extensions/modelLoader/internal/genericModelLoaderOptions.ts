// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ModelProcessor } from "../../../core/model/internal/ModelProcessor.js";
import type { SupportedModelVersions } from "../../../core/model/internal/supportedModelVersions.js";

export interface GenericModelLoaderOptions {
	/**
	 * Configures post-processing of models for the `ModelLoader` API
	 *
	 * By default, only document models are processed.
	 */
	readonly modelProcessors?: ModelProcessor[];

	readonly supportedModelVersions?: SupportedModelVersions;
}
