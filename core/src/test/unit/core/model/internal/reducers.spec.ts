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
