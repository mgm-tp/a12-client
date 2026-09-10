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
