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

import type { Model } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";

import { ModelLenses } from "../../../../core/model/index.js";
import { createDummyModel, modelListToMap } from "../../../mocks/ModelsUtil.js";
import { createModelGraph } from "../../../mocks/store/store.js";
import { createAppModel } from "../../../utils/appmodel-utils.js";
import { createLensLawsTests } from "../../../utils/createLensLawsTests.js";

describe("core.model", () => {
	describe("lenses", () => {
		it("modelGraph", () => {
			const state = { models: { modelGraph: createModelGraph() } };
			const modelGraph = state.models.modelGraph;
			createLensLawsTests(ModelLenses.modelGraph, state, modelGraph);
		});

		it("models map", () => {
			const state = {
				models: { models: modelListToMap([createDummyModel("a"), createDummyModel("b")]) }
			};
			const models = state.models.models;
			createLensLawsTests(ModelLenses.models, state, models);
		});

		describe("single model by id", () => {
			describe("non-existing model with empty models map", () => {
				const state = { models: { models: {}, applicationModel: createAppModel() } };
				const model = createDummyModel("a");
				createLensLawsTests(ModelLenses.modelById(model.header.id), state, model);
			});

			describe("existing model", () => {
				const model = createDummyModel("a", "form");
				const changed = {
					...model,
					header: { ...model.header, modelType: "changed" }
				} satisfies Model;
				const state = {
					models: {
						models: modelListToMap([model, createDummyModel("b")]),
						applicationModel: createAppModel()
					}
				};
				createLensLawsTests(ModelLenses.modelById(model.header.id), state, changed);
			});

			describe("non-existing model", () => {
				const model = createDummyModel("a");
				const state = {
					models: {
						models: modelListToMap([createDummyModel("b")]),
						applicationModel: createAppModel()
					}
				};
				createLensLawsTests(ModelLenses.modelById(model.header.id), state, model);
			});

			describe("undefined model (to remove it)", () => {
				const model = createDummyModel("a");
				const state = {
					models: { models: modelListToMap([model]), applicationModel: createAppModel() }
				};
				createLensLawsTests(ModelLenses.modelById(model.header.id), state, undefined);
			});
		});
	});
});
