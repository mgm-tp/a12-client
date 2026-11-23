// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import semverSatisfies from "semver/functions/satisfies.js";

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";

import { Model } from "./Model.js";
import type { ModelMap } from "./ModelState.js";
import type { SupportedModelVersions } from "./supportedModelVersions.js";

// this mapping is computed during the build/bundling process and must be injected by the bundler (e.g. webpack)
declare const __A12_MODEL_VERSIONS__: SupportedModelVersions | undefined;

function filterUnsupportedModelVersions(
	model: ModelAPI,
	supportedModelVersions?: SupportedModelVersions
): ModelAPI | Model.Error {
	// if the bundler does not inject the mapping, trying to use the variable directly throws a reference error
	// therefore, we check its existence with `typeof` first (which is able to handle undeclared variables)
	const compatibleModelVersions =
		typeof __A12_MODEL_VERSIONS__ !== "undefined" ? __A12_MODEL_VERSIONS__ : supportedModelVersions;

	if (!compatibleModelVersions) {
		return model;
	}

	const { modelType, modelVersion, id } = model.header;

	const compatibleVersion = compatibleModelVersions[modelType];
	if (compatibleVersion) {
		if (!semverSatisfies(modelVersion, compatibleVersion)) {
			return createIncompatibleModelError(modelVersion, compatibleVersion, modelType, id);
		}
	}

	return model;
}

/** @internal */
export function createIncompatibleModelError(
	modelVersion: string,
	requiredVersionSpec: string,
	modelType: string,
	modelId: string
): Model.Error {
	return {
		type: "UNSUPPORTED_MODEL_VERSION",
		message: `Model [type: ${modelType}, id: ${modelId}] is specified in version '${modelVersion}' which does not satisfy the defined version range '${requiredVersionSpec}'.`
	};
}

/** @internal */
export function checkUnsupportedModelVersion(
	modelMap: ModelMap,
	supportedModelVersions?: SupportedModelVersions
): ModelMap {
	return Object.fromEntries(
		Object.entries(modelMap).map(([modelId, result]) => [
			modelId,
			result !== undefined && !Model.Error.isInstance(result)
				? filterUnsupportedModelVersions(result, supportedModelVersions)
				: result
		])
	);
}
