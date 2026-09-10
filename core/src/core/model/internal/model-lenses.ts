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

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/Relationship/ModelGraph.js";

import type { Lens } from "../../lenses.js";

import type { Model } from "./Model.js";
import type { ModelMap } from "./ModelState.js";
import { ModelSelectors, sliceSelector } from "./selectors.js";

const modelGraphLens: Lens<object, ModelGraph> = {
	get: ModelSelectors.modelGraph(),
	set: modelGraph => s =>
		modelGraph !== modelGraphLens.get(s) ? { ...s, models: { ...sliceSelector(s), modelGraph } } : s
};

const modelsLens: Lens<object, ModelMap> = {
	get: ModelSelectors.models(),
	set(models) {
		return function (s) {
			return models !== modelsLens.get(s) ? { ...s, models: { ...sliceSelector(s), models } } : s;
		};
	}
};

const modelLens = (modelId: string): Lens<object, ModelAPI | Model.Error | undefined> => {
	return {
		get: s => modelsLens.get(s)[modelId],
		set: m => s => updateModel(modelId)(m)(s)
	};
};

function updateModel(modelId: string) {
	return (maybeM: ModelAPI | Model.Error | undefined) =>
		maybeM ? replaceModel(modelId, maybeM) : removeModel(modelId);
}

function replaceModel(modelId: string, m: ModelAPI | Model.Error) {
	return (s: object) => {
		const models = modelsLens.get(s);
		return m !== models[modelId] ? modelsLens.set({ ...models, [modelId]: m })(s) : s;
	};
}

function removeModel(modelId: string) {
	return (s: object) => {
		const models = modelsLens.get(s);
		const { [modelId]: removed, ...rest } = models;
		return removed ? modelsLens.set(rest)(s) : s;
	};
}

/**
 * Functions to access the "models" slice inside the Client state.
 *
 * NOTE: To work with `applicationModel`, use the DynamicConfig API instead.
 */
export const ModelLenses = {
	/**
	 * Lens for accessing and updating the modelGraph
	 */
	modelGraph: modelGraphLens,
	/**
	 * Lens for accessing and updating the whole models map at once
	 */
	models: modelsLens,
	/**
	 * Lens constructor for accessing and updating a specific model by id
	 */
	modelById: modelLens
};
