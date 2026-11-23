// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/Relationship/ModelGraph.js";

import type { ApplicationModel } from "./ApplicationModel.js";
import type { Model } from "./Model.js";

/**
 * @internal
 */
export interface ModelState {
	readonly applicationModel: ApplicationModel;
	readonly modelGraph: ModelGraph;
	readonly models: ModelMap;
}

/**
 * Maps a `modelId` to either a loaded a12 model, an error, or `undefined`
 * if the model does not exist
 */
export interface ModelMap {
	readonly [id: string]: ModelAPI | Model.Error | undefined;
}
