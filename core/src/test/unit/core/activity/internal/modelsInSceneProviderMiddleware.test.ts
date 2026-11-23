// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual, partialDeepStrictEqual, strictEqual } from "node:assert/strict";
import { mock } from "node:test";

import type { Dispatch, MiddlewareAPI } from "redux";
import type { AnyAction } from "typescript-fsa";

import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/Relationship/ModelGraph.js";

import { ActivityActions } from "../../../../../core/activity/index.js";
import { ModuleRegistryProvider } from "../../../../../core/application/internal/factories/moduleRegistryProvider.js";
import type { DynamicFlow } from "../../../../../core/configurationNG/internal/typings.js";
import type { Model } from "../../../../../core/model/internal/Model.js";
import { modelsInSceneProviderMiddleware } from "../../../../../core/model/internal/modelsInSceneProviderMiddleware.js";
import type { ModelMap } from "../../../../../core/model/internal/ModelState.js";
import type { ReferencedModel } from "../../../../../core/model/internal/ReferencedModel.js";
import type { ViewNGComponent } from "../../../../../core/view/internal/viewNG.js";
import { modelListToMap } from "../../../../mocks/ModelsUtil.js";
import { createGeneralStore } from "../../../../mocks/store/store.js";
import { createActivity } from "../../../../utils/activity.js";

interface Options {
	readonly modelDescriptors?: Model.Descriptor[];
	readonly modelGraph?: ModelGraph;
	readonly modelMap?: ModelMap;
}

describe("core.activity", () => {
	const activityId = "1";
	const descriptor = { test: "modelsInScene" };
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

		return { apiStub: store satisfies MiddlewareAPI, nextStub: mock.fn<Dispatch>() };
	}

	describe("modelsInSceneProviderMiddleware", () => {
		it("provides referenced models and model graph in payload directly for ActivityActions", () => {
			const modelDescriptors: Model.Descriptor[] = [
				{ modelType: "t", name: "t1" },
				{ modelType: "t", name: "t2" }
			];
			const expectedRefs = modelDescriptors.map(
				d =>
					({
						loadingState: "notLoaded",
						model: d
					}) as ReferencedModel.NotLoaded
			);

			const modelGraph: ModelGraph = {
				documentModels: [],
				composeDocumentModels: [],
				relationshipModels: [],
				genericModels: modelDescriptors.map(d => ({ type: d.modelType, modelId: d.name }))
			};

			const { apiStub, nextStub } = setupStore({ modelDescriptors, modelGraph });
			const action = ActivityActions.setDirty({ activityId, dirty: true });

			void modelsInSceneProviderMiddleware(apiStub)(nextStub)(action);

			strictEqual(nextStub.mock.callCount(), 1);
			partialDeepStrictEqual(nextStub.mock.calls.at(0)?.arguments, [
				{ payload: { modelsInScene: expectedRefs, modelGraph } }
			]);
		});

		it("provides referenced models and model graph in payload.params for AsyncActivityActions", () => {
			const modelDescriptors: Model.Descriptor[] = [
				{ modelType: "t", name: "t1" },
				{ modelType: "t", name: "t2" }
			];
			const expectedRefs = modelDescriptors.map(
				d =>
					({
						loadingState: "notLoaded",
						model: d
					}) as ReferencedModel.NotLoaded
			);

			const modelGraph: ModelGraph = {
				documentModels: [],
				composeDocumentModels: [],
				relationshipModels: [],
				genericModels: modelDescriptors.map(d => ({ type: d.modelType, modelId: d.name }))
			};

			const { apiStub, nextStub } = setupStore({ modelDescriptors, modelGraph });
			const action = ActivityActions.commit.done({ params: { activityId }, result: {} });

			void modelsInSceneProviderMiddleware(apiStub)(nextStub)(action);

			strictEqual(nextStub.mock.callCount(), 1);
			partialDeepStrictEqual(nextStub.mock.calls.at(0)?.arguments, [
				{
					payload: {
						params: { modelsInScene: expectedRefs, modelGraph }
					}
				}
			]);
		});

		it("provides empty array in payload when no models in scene exist", () => {
			const { apiStub, nextStub } = setupStore();
			const action = ActivityActions.setDirty({ activityId, dirty: true });

			void modelsInSceneProviderMiddleware(apiStub)(nextStub)(action);

			partialDeepStrictEqual(nextStub.mock.calls.at(0)?.arguments, [
				{ payload: { modelsInScene: [] } }
			]);
		});

		it("provides loaded references in payload when models in scene are already loaded", () => {
			const modelDescriptors: Model.Descriptor[] = [
				{ modelType: "t", name: "t1" },
				{ modelType: "t", name: "t2" }
			];
			const expectedRefs = modelDescriptors.map(d => ({
				loadingState: "loaded",
				model: { header: { id: d.name, modelType: d.modelType, modelVersion: "1" }, content: {} }
			})) as ReferencedModel.Loaded[];

			const modelMap = modelListToMap(expectedRefs.map(r => r.model));

			const { apiStub, nextStub } = setupStore({ modelDescriptors, modelMap });
			const action = ActivityActions.setDirty({ activityId, dirty: true });

			void modelsInSceneProviderMiddleware(apiStub)(nextStub)(action);

			partialDeepStrictEqual(nextStub.mock.calls.at(0)?.arguments, [
				{ payload: { modelsInScene: expectedRefs } }
			]);
		});

		it("provides error references in payload when models in scene failed to load", () => {
			const modelDescriptors: Model.Descriptor[] = [
				{ modelType: "t", name: "t1" },
				{ modelType: "t", name: "t2" }
			];

			const modelMap = {
				t1: {
					type: "NO_SUITABLE_MODEL_LOADER",
					message: "Failed to load t1"
				} satisfies Model.Error,
				t2: {
					type: "UNSUPPORTED_MODEL_VERSION",
					message: "Failed to load t2"
				} satisfies Model.Error
			};

			const expectedRefs = Object.values(modelMap).map(e => ({
				loadingState: "error",
				model: e
			})) as ReferencedModel.Error[];

			const { apiStub, nextStub } = setupStore({ modelDescriptors, modelMap });
			const action = ActivityActions.setDirty({ activityId, dirty: true });

			void modelsInSceneProviderMiddleware(apiStub)(nextStub)(action);

			partialDeepStrictEqual(nextStub.mock.calls.at(0)?.arguments, [
				{ payload: { modelsInScene: expectedRefs } }
			]);
		});

		it("passes actions without activityId unchanged", () => {
			const { apiStub, nextStub } = setupStore();
			const action: AnyAction = { type: "other" };

			void modelsInSceneProviderMiddleware(apiStub)(nextStub)(action);

			strictEqual(nextStub.mock.callCount(), 1);
			deepStrictEqual(nextStub.mock.calls.at(0)?.arguments, [action]);
		});
	});
});
