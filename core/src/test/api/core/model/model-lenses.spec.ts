// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
