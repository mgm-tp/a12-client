// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";

import type { Model } from "../../../core/model/index.js";

/**
 * A model fetcher returns a {@link ModelFetcherResult} for every given {@link Model.Descriptor}.
 */
export interface ModelFetcher {
	(descriptor: Model.Descriptor[]): Promise<ModelFetcherResult[]>;
}

export interface ModelFetcherResult {
	readonly modelId: string;
	readonly result: ModelAPI | Model.DocumentAndValidationModel | Model.Error;
}
