// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";

import { ModelActions, ModelReducers } from "../../../../../core/model/index.js";
import type { ModelMap, ModelState } from "../../../../../core/model/internal/ModelState.js";

const state: ModelState = {
	applicationModel: {
		header: {
			id: "ApplicationModel",
			modelType: "application",
			modelVersion: "1.0.0"
		},
		content: {
			region: {
				name: "APP",
				layout: { name: "ApplicationFrame" }
			},
			defaultRegion: [],
			modules: []
		}
	},
	modelGraph: {
		documentModels: [],
		relationshipModels: [],
		composeDocumentModels: []
	},
	models: {
		model1: {
			header: { id: "model1", modelType: "form", modelVersion: "0.0.0" },
			content: {}
		},
		model2: {
			header: { id: "model2", modelType: "document", modelVersion: "0.0.0" },
			content: {}
		}
	}
};

describe("core.model.internal", () => {
	describe("ModelReducers", () => {
		describe("models", () => {
			it("merges the existing model map with the one given in the payload of the action", () => {
				const modelMap: ModelMap = {
					model2: {
						header: { id: "model2", modelType: "form", modelVersion: "1.0.0" },
						content: {}
					},
					model3: {
						header: {
							id: "model3",
							modelType: "document",
							modelVersion: "0.0.0"
						},
						content: {}
					}
				};

				const newState: ModelState = ModelReducers.models(state, ModelActions.setModels(modelMap));

				strictEqual(newState.models.model1, newState.models.model1);
				strictEqual(newState.models.model2, modelMap.model2);
				strictEqual(newState.models.model3, modelMap.model3);
			});
		});
	});
});
