// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
