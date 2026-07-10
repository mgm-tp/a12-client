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

import { deepStrictEqual } from "node:assert/strict";
import { mock } from "node:test";

import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access";

import { ModuleRegistryProvider } from "../../../../../core/application/internal/factories/moduleRegistryProvider.js";
import type { DynamicFlow } from "../../../../../core/configurationNG/index.js";
import { ModelSelectors, type ModelMap } from "../../../../../core/model/index.js";
import type { Model } from "../../../../../core/model/internal/Model.js";
import type { ViewNGComponent } from "../../../../../core/view/internal/viewNG.js";
import { createDummyModel } from "../../../../mocks/ModelsUtil.js";
import { createGeneralStore } from "../../../../mocks/store/store.js";
import { createActivity } from "../../../../utils/activity.js";

interface Options {
	readonly modelDescriptors?: Model.Descriptor[];
	readonly modelGraph?: ModelGraph;
	readonly modelMap?: ModelMap;
}

describe("core.model.internal.selectors", () => {
	describe("referencedModelsInScene", () => {
		const activityId = "1";
		const descriptor = { test: "modelRefs" };

		function setupStore(opts?: Options) {
			const { store } = createGeneralStore({
				activities: [createActivity({ id: activityId, descriptor })],
				modelGraph: opts?.modelGraph,
				modelMap: opts?.modelMap
			});

			const TEST_FLOWS: DynamicFlow[] = [
				{
					name: "test-flow",
					scenes: [
						{
							name: "test-scene",
							matches: d => d === descriptor,
							sceneChange: {
								onEnter: [
									{
										type: "DYNAMIC_ADD_VIEW",
										region: "/CONTENT",
										component: mock.fn<ViewNGComponent>(),
										models: opts?.modelDescriptors
									}
								]
							}
						}
					]
				}
			];

			ModuleRegistryProvider.getInstance().addModule({
				id: "test-module",
				flows: () => TEST_FLOWS
			});

			return { store };
		}

		it("returns empty array when no models in scene", () => {
			const { store } = setupStore();

			const result = ModelSelectors.referencedModelsInScene(activityId)(store.getState());
			deepStrictEqual(result, []);
		});

		it("returns referenced models in scene according to their loading state", () => {
			const modelA: Model.Descriptor = { name: "A", modelType: "T" };
			const modelB: Model.Descriptor = { name: "B", modelType: "T" };
			const modelC: Model.Descriptor = { name: "C", modelType: "T" };

			const loadedModel = createDummyModel("A");
			const errorModel = { message: "failed", type: "UNKNOWN" } satisfies Model.Error;

			const { store } = setupStore({
				modelDescriptors: [modelA, modelB, modelC],
				modelMap: {
					A: loadedModel,
					C: errorModel
				}
			});

			const result = ModelSelectors.referencedModelsInScene(activityId)(store.getState());
			deepStrictEqual(result, [
				{ loadingState: "loaded", model: loadedModel, direct: true },
				{ loadingState: "notLoaded", model: modelB, direct: true },
				{ loadingState: "error", model: errorModel, direct: true }
			]);
		});

		it("noes not set direct prop for models referenced only transitively", () => {
			const modelA: Model.Descriptor = { name: "A", modelType: "T" };
			const modelB: Model.Descriptor = { name: "B", modelType: "T" };
			const errorModel = { message: "failed", type: "UNKNOWN" } satisfies Model.Error;

			const { store } = setupStore({
				modelDescriptors: [modelA],
				modelMap: { C: errorModel },
				modelGraph: mockModelGraph(
					{ type: "T", modelId: "A", modelReferences: [{ modelType: "T", reference: "B" }] },
					{ type: "T", modelId: "B", modelReferences: [{ modelType: "T", reference: "C" }] },
					{ type: "T", modelId: "C" }
				)
			});

			const result = ModelSelectors.referencedModelsInScene(activityId)(store.getState());
			deepStrictEqual(result, [
				{ loadingState: "notLoaded", model: modelA, direct: true },
				{ loadingState: "notLoaded", model: modelB },
				{ loadingState: "error", model: errorModel }
			]);
		});

		it("sets direct prop for a model referenced both directly and transitively", () => {
			const modelA: Model.Descriptor = { name: "A", modelType: "T" };
			const modelB: Model.Descriptor = { name: "B", modelType: "T" };

			const { store } = setupStore({
				modelDescriptors: [modelA, modelB],
				modelGraph: mockModelGraph(
					{ type: "T", modelId: "A", modelReferences: [{ modelType: "T", reference: "B" }] },
					{ type: "T", modelId: "B", modelReferences: [] }
				)
			});

			const result = ModelSelectors.referencedModelsInScene(activityId)(store.getState());
			deepStrictEqual(result, [
				{ loadingState: "notLoaded", model: modelA, direct: true },
				{ loadingState: "notLoaded", model: modelB, direct: true }
			]);
		});
	});
});

function mockModelGraph(...genericModels: ModelGraph.OtherModel[]): ModelGraph {
	return {
		documentModels: [],
		composeDocumentModels: [],
		relationshipModels: [],
		genericModels
	};
}
