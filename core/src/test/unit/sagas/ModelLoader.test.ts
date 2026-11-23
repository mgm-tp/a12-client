// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual, strictEqual } from "node:assert/strict";

import type { Store } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import type { AnyAction } from "typescript-fsa";

import type { ActivityMap } from "../../../core/activity/index.js";
import { ActivityActions, ActivitySelectors } from "../../../core/activity/index.js";
import { handlePushAction } from "../../../core/activity/internal/reducers/handler/push.js";
import { handleSetCase } from "../../../core/activity/internal/reducers/handler/setCase.js";
import type { ApplicationModel, Model, ModelLoader } from "../../../core/model/index.js";
import { ModelActions } from "../../../core/model/index.js";
import { loadModels } from "../../../core/model/internal/ModelLoader.js";
import type { ModelMap } from "../../../core/model/internal/ModelState.js";
import { createDummyModel } from "../../mocks/ModelsUtil.js";
import { createGeneralStore } from "../../mocks/store/store.js";
import { createActivity } from "../../utils/activity.js";

describe("core.application.internal.sagas.models", () => {
	describe("ModelLoading", () => {
		describe("when there is no scene in the application model matching the activity with the id from the action payload", () => {
			it("does nothing", async () => {
				const activityId = "A";

				const store = createStore({ activityId, modelDescriptors: [] });

				const modelLoader: ModelLoader = {
					name: "mock",
					async load() {
						throw new Error();
					}
				};

				const saga = () => loadModels(modelLoader);
				const {
					effects: { put = [] }
				} = await expectSaga(saga)
					.withState(store.getState())
					// Retrigger activity in order to trigger saga
					.dispatch(ActivityActions.create({ activityDescriptor: {} }))
					.silentRun();

				const setModelsPut = put.filter(x => ModelActions.setModels.match(x.payload.action));
				strictEqual(setModelsPut.length, 0, "Expected to find no set models actions!");
			});
		});

		describe("when there are no model descriptors in the application model matching the scene derived from the activity id from the action payload", () => {
			it("does nothing", async () => {
				const activityId = "A";

				const store = createStore({ activityId, modelDescriptors: [] });
				const activity = ActivitySelectors.activityById(activityId)(store.getState());
				if (activity === undefined) {
					throw new Error("Test setup failed!");
				}

				const modelLoader: ModelLoader = {
					name: "mock",
					async load() {
						throw new Error();
					}
				};

				const saga = () => loadModels(modelLoader);
				const {
					effects: { put = [] }
				} = await expectSaga(saga)
					.withState(store.getState())
					// Retrigger activity in order to trigger saga
					.dispatch(ActivityActions.create({ activityDescriptor: activity.descriptor }))
					.silentRun();

				const setModelsPut = put.filter(x => ModelActions.setModels.match(x.payload.action));
				strictEqual(setModelsPut.length, 0, "Expected to find no set models actions!");
			});
		});

		describe("when the case changes in an activity and there is a scene in the application model matching this activity", () => {
			function setCaseReducerForTest(state: object | undefined, action: AnyAction): object {
				if (ActivityActions.setCase.match(action)) {
					return {
						...state,
						activities: handleSetCase((state as { activities: ActivityMap }).activities, action)
					};
				} else {
					return state ?? {};
				}
			}

			it("dispatches only one set models action containing all loaded models and errors", async () => {
				const activityId = "A";
				const caze = "dummyCase";

				const store = createStore({
					activityId,
					modelDescriptors: [{ name: "anyId1", modelType: "anyType" }],
					case: caze,
					caseModelDescriptors: [{ name: "anyId4", modelType: "anyType" }]
				});
				const activity = ActivitySelectors.activityById(activityId)(store.getState());
				if (activity === undefined) {
					throw new Error("Test setup failed!");
				}

				const model1 = createDummyModel("anyId1", "anyType", [
					{ reference: "anyId2", modelType: "anyType" },
					{ reference: "anyId3", modelType: "anyType" }
				]);
				const model2 = createDummyModel("anyId2", "anyType");
				const model3: Model.Error = { type: "NOT_FOUND" };
				const model4 = createDummyModel("anyId4", "anyType");

				const modelLoaderMock: ModelLoader = {
					name: "mock",
					async load() {
						return {
							anyId1: model1,
							anyId2: model2,
							anyId3: model3,
							anyId4: model4
						};
					}
				};

				const saga = () => loadModels(modelLoaderMock);
				const {
					effects: { put = [] }
				} = await expectSaga(saga)
					.withReducer(setCaseReducerForTest, store.getState())
					.dispatch(ActivityActions.setCase({ activityId, case: caze }))
					.silentRun();

				const setModelsPut = put.filter(x => ModelActions.setModels.match(x.payload.action));
				strictEqual(setModelsPut.length, 1, "Expected to find one set models action!");

				const modelMap = setModelsPut[0].payload.action.payload;
				deepStrictEqual(modelMap, {
					anyId1: model1,
					anyId2: model2,
					anyId3: model3,
					anyId4: model4
				});
			});
		});

		describe("when there is a scene in the application model matching the activity with the id from the action payload", () => {
			function pushReducerForTest(state: object | undefined, action: AnyAction): object {
				if (ActivityActions.push.match(action)) {
					return {
						...state,
						activities: handlePushAction((state as { activities: ActivityMap }).activities, action)
					};
				} else {
					return state ?? {};
				}
			}
			it("dispatches only one set models action containing all loaded models and errors", async () => {
				const activityId = "A";
				const activity = createActivity({
					id: activityId,
					descriptor: { id: ID_FOR_DESCRIPTOR }
				});

				const storeWithoutActivity = createStore({
					modelDescriptors: [{ name: "anyId1", modelType: "anyType" }]
				});

				const model1 = createDummyModel("anyId1", "anyType", [
					{ reference: "anyId2", modelType: "anyType" },
					{ reference: "anyId3", modelType: "anyType" }
				]);
				const model2 = createDummyModel("anyId2", "anyType");
				const model3: Model.Error = { type: "NOT_FOUND" };

				const modelLoaderMock: ModelLoader = {
					name: "mock",
					async load() {
						return {
							anyId1: model1,
							anyId2: model2,
							anyId3: model3
						};
					}
				};

				const saga = () => loadModels(modelLoaderMock);
				const {
					effects: { put = [] }
				} = await expectSaga(saga)
					.withReducer(pushReducerForTest, storeWithoutActivity.getState())
					// Retrigger activity in order to trigger saga
					.dispatch(ActivityActions.push({ activity }))
					.silentRun();

				const setModelsPut = put.filter(x => ModelActions.setModels.match(x.payload.action));
				strictEqual(setModelsPut.length, 1, "Expected to find one set models action!");

				const modelMap = setModelsPut[0].payload.action.payload;
				deepStrictEqual(modelMap, {
					anyId1: model1,
					anyId2: model2,
					anyId3: model3
				});
			});
		});
	});
});

const ID_FOR_DESCRIPTOR = "ModelLoadingModel";

function createStore(options: {
	modelDescriptors: Model.Descriptor[];
	activityId?: string;
	modelMap?: ModelMap;
	case?: string;
	caseModelDescriptors?: Model.Descriptor[];
}): Store<object> {
	const { activityId, case: caze, modelDescriptors, modelMap, caseModelDescriptors } = options;
	const id = ID_FOR_DESCRIPTOR;

	const module: ApplicationModel.Module = {
		name: "ModelLoadingModule",
		menu: { name: "ModelLoading" },
		flows: [
			{
				name: "ModelLoadingFlow",
				scenes: [
					{
						name: "ModelLoading",
						matchConditions: [{ key: "id", mustEqual: id }],
						sceneChange: {
							onEnter: [
								{
									type: "VIEW_ADD",
									name: "anyContainer",
									models: modelDescriptors
								}
							]
						},
						...(caze
							? {
									cases: [
										{
											name: "ModelLoadingCase",
											sceneChange: {
												onEnter: [
													{
														type: "VIEW_ADD",
														name: "anyContainer",
														...(caseModelDescriptors
															? {
																	models: caseModelDescriptors
																}
															: {})
													}
												]
											}
										}
									]
								}
							: {})
					}
				]
			}
		]
	};

	const activity = activityId ? createActivity({ id: activityId, descriptor: { id } }) : undefined;

	return createGeneralStore({
		modelMap: modelMap ?? {},
		activities: activity ? [activity] : [],
		modules: [module]
	}).store;
}
