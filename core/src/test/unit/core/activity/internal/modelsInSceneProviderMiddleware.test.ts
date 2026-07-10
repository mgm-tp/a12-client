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

import { deepStrictEqual, partialDeepStrictEqual, strictEqual } from "node:assert/strict";
import { mock } from "node:test";

import type { Action, MiddlewareAPI } from "redux";

import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access";

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

		return {
			apiStub: store satisfies MiddlewareAPI,
			nextStub: mock.fn<(action: unknown) => unknown>()
		};
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
			const action: Action = { type: "other" };

			void modelsInSceneProviderMiddleware(apiStub)(nextStub)(action);

			strictEqual(nextStub.mock.callCount(), 1);
			deepStrictEqual(nextStub.mock.calls.at(0)?.arguments, [action]);
		});
	});
});
