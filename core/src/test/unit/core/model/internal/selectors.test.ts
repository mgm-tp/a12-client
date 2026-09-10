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

import { deepStrictEqual, notStrictEqual, strictEqual, throws } from "node:assert/strict";
import { mock } from "node:test";

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";

import { ActivitySelectors } from "../../../../../core/activity/index.js";
import type { ApplicationModel, Model } from "../../../../../core/model/index.js";
import {
	InternalModelSelectors,
	modelDescriptors,
	ModelSelectors
} from "../../../../../core/model/internal/selectors.js";
import { modelWithOutSubRegions } from "../../../../mocks/frame/storeMocks.js";
import { isOverviewModel } from "../../../../mocks/ModelsUtil.js";
import { createGeneralStore } from "../../../../mocks/store/store.js";
import { createActivity } from "../../../../utils/activity.js";
import { US_LOCALE } from "../../../../utils/localization.js";
import type { ClientState } from "../../../../utils/test-utils.js";

describe("core.model.internal.InternalModelSelectors", () => {
	describe("InternalModelSelectors", () => {
		const defaultState: ClientState = {
			activities: {},
			models: {
				applicationModel: modelWithOutSubRegions,
				modelGraph: {
					documentModels: [],
					relationshipModels: [],
					composeDocumentModels: []
				},
				models: {}
			},
			locale: US_LOCALE,
			application: { busy: false, registeredModules: [] },
			notifications: []
		};

		const defaultSceneReference: ApplicationModel.SceneReference = {
			moduleName: "Dummy Module",
			flowName: "DummyFlow1",
			sceneName: "DummyOverview"
		};

		const defaultModelDescriptor: Model.Descriptor = {
			modelType: "overview",
			name: "Dummy-overview"
		};

		const caseModelDescriptor: Model.Descriptor = {
			modelType: "overview",
			name: "Case-overview"
		};

		describe("Note: all selector factories return functions which return the objects described below", () => {
			describe("modelDescriptorsByActivityId", () => {
				describe("given an activity id", () => {
					it("returns an empty list if activity does not exist", () => {
						const activity = createActivity({ id: "any" });
						const { store } = createGeneralStore();

						const activityByIdStub = mock.method(
							ActivitySelectors,
							"activityById",
							() => () => undefined
						);

						const result = ModelSelectors.modelDescriptorsByActivityId(activity.id)(
							store.getState()
						);
						deepStrictEqual(result, []);

						strictEqual(activityByIdStub.mock.callCount(), 1);
						deepStrictEqual(activityByIdStub.mock.calls[0].arguments, [activity.id]);
					});

					it("returns an empty list if no scene for the activity exists", () => {
						const activity = createActivity({ id: "any" });
						const { store } = createGeneralStore();

						mock.method(ActivitySelectors, "activityById", () => () => activity);

						const initialActivities = [createActivity({ id: "other" })];
						const initiatingPathStub = mock.method(
							ActivitySelectors,
							"initiatingPath",
							() => () => initialActivities
						);

						const sceneReferencesStub = mock.method(
							InternalModelSelectors,
							"sceneReferenceByActivities",
							() => () => undefined
						);

						const result = ModelSelectors.modelDescriptorsByActivityId(activity.id)(
							store.getState()
						);
						deepStrictEqual(result, []);

						strictEqual(initiatingPathStub.mock.callCount(), 1);
						deepStrictEqual(initiatingPathStub.mock.calls[0].arguments, [activity.id]);

						strictEqual(sceneReferencesStub.mock.callCount(), 1);
						deepStrictEqual(sceneReferencesStub.mock.calls[0].arguments, [
							[...initialActivities, activity]
						]);
					});

					it("returns the result of modelDescriptors for the found scene", () => {
						const activity = createActivity({ id: "any" });

						mock.method(ActivitySelectors, "activityById", () => () => activity);

						mock.method(
							InternalModelSelectors,
							"sceneReferenceByActivities",
							() => () => defaultSceneReference
						);

						const state = createState({});

						const result = ModelSelectors.modelDescriptorsByActivityId(activity.id)(state);
						deepStrictEqual(result, [defaultModelDescriptor]);
					});

					it("returns the result of modelDescriptors including from the default case, when the activity has no case", () => {
						const activity = createActivity({ id: "any" });

						mock.method(ActivitySelectors, "activityById", () => () => activity);

						mock.method(
							InternalModelSelectors,
							"sceneReferenceByActivities",
							() => () => defaultSceneReference
						);

						const state = createState({ caseModelDescriptors: [caseModelDescriptor] });

						const result = ModelSelectors.modelDescriptorsByActivityId(activity.id)(state);
						deepStrictEqual(result, [defaultModelDescriptor, caseModelDescriptor]);
					});

					it("returns the result of modelDescriptors including from the current activity case", () => {
						const activity = createActivity({ id: "any", case: "dummyCase" });

						mock.method(ActivitySelectors, "activityById", () => () => activity);

						mock.method(
							InternalModelSelectors,
							"sceneReferenceByActivities",
							() => () => defaultSceneReference
						);

						const state = createState({
							case: "dummyCase",
							caseModelDescriptors: [caseModelDescriptor]
						});

						const result = ModelSelectors.modelDescriptorsByActivityId(activity.id)(state);
						deepStrictEqual(result, [defaultModelDescriptor, caseModelDescriptor]);
					});

					it("returns the result of modelDescriptors for the found scene with a specified documentModel", () => {
						const activity = createActivity({ id: "any", descriptor: { model: "anyModel2" } });

						mock.method(ActivitySelectors, "activityById", () => () => activity);
						mock.method(
							InternalModelSelectors,
							"sceneReferenceByActivities",
							() => () => defaultSceneReference
						);

						const modelDescriptors: Model.Descriptor[] = [
							{ name: "anyName1", modelType: "anyType", documentModel: "anyModel1" },
							{ name: "anyName2", modelType: "anyType", documentModel: "anyModel2" },
							{ name: "anyName3", modelType: "anyType", documentModel: "anyModel3" }
						];

						const state = createState({ modelDescriptors });

						const result = ModelSelectors.modelDescriptorsByActivityId(activity.id)(state);
						deepStrictEqual(result, [modelDescriptors[1]]);
					});
				});
			});

			describe("modelDescriptors", () => {
				describe("given a scene reference", () => {
					it("returns the correct modelDescriptor when onEnter matches", () => {
						const state = createState({});

						const result = modelDescriptors(defaultSceneReference)(state);

						notStrictEqual(result, undefined, "Expected a model to be returned");
						deepStrictEqual(result, [defaultModelDescriptor]);
					});

					it("returns the correct modelDescriptor when onExit matches", () => {
						const state = createState({ setOnExit: true });

						const result = modelDescriptors(defaultSceneReference)(state);

						notStrictEqual(result, undefined, "Expected a model to be returned");
						deepStrictEqual(result, [defaultModelDescriptor]);
					});

					it("returns the correct model descriptors, when onEnter and case onEnter matches", () => {
						const state = createState({
							case: "dummyCase",
							caseModelDescriptors: [caseModelDescriptor]
						});

						const result = modelDescriptors(defaultSceneReference, "dummyCase")(state);

						notStrictEqual(result, undefined, "Expected a model to be returned");
						deepStrictEqual(result, [defaultModelDescriptor, caseModelDescriptor]);
					});

					it("returns the correct model descriptors, when onEnter matches and default case has descriptors", () => {
						const state = createState({
							caseModelDescriptors: [caseModelDescriptor]
						});

						const result = modelDescriptors(defaultSceneReference)(state);

						notStrictEqual(result, undefined, "Expected a model to be returned");
						deepStrictEqual(result, [defaultModelDescriptor, caseModelDescriptor]);
					});
				});
			});

			describe("sceneByReference", () => {
				describe("given an array with a module name, flow name and scene name", () => {
					it("returns the scene that matches the input", () => {
						const expectedResult: ApplicationModel.Scene = {
							name: "DummyOverview",
							matchConditions: [
								{
									key: "model",
									mustEqual: "CRUD"
								},
								{
									key: "instance",
									isSet: false
								}
							],
							sceneChange: {
								onEnter: [
									{
										type: "REGION_CLEAR"
									},
									{
										type: "VIEW_ADD",
										name: "OverviewCRUD",
										models: [{ modelType: "overview", name: "Dummy-overview" }]
									}
								]
							},
							defaultCase: "defaultCase",
							cases: [
								{
									name: "defaultCase",
									sceneChange: {
										onEnter: [{ type: "VIEW_ADD", name: "OverviewCRUD" }]
									}
								}
							]
						};

						const initialState = createState({});

						const result =
							InternalModelSelectors.sceneByReference(defaultSceneReference)(initialState);

						notStrictEqual(result, undefined, "Expected a model to be returned");
						deepStrictEqual(result, expectedResult);
					});

					describe("Error Handling", () => {
						const initialState = createState({});

						it("throws an error if the module is unknown", () => {
							const sceneReference: ApplicationModel.SceneReference = {
								...defaultSceneReference,
								moduleName: "Unknown Module"
							};

							throws(() => InternalModelSelectors.sceneByReference(sceneReference)(initialState), {
								message: 'No module with the name "Unknown Module" exists.'
							});
						});

						it("throws an error if the flow does not exists in the specified module", () => {
							const sceneReference: ApplicationModel.SceneReference = {
								...defaultSceneReference,
								flowName: "UnknownFlow1"
							};

							throws(() => InternalModelSelectors.sceneByReference(sceneReference)(initialState), {
								message: 'No flow with the name "UnknownFlow1" exists in the module "Dummy Module".'
							});
						});

						it("throws an error if the scene does not exists in the specified flow of the specified module", () => {
							const sceneReference: ApplicationModel.SceneReference = {
								moduleName: "Dummy Module",
								flowName: "DummyFlow1",
								sceneName: "UnknownOverview"
							};

							throws(() => InternalModelSelectors.sceneByReference(sceneReference)(initialState), {
								message:
									'No scene with the name "UnknownOverview" exists in the flow "DummyFlow1" of the module "Dummy Module".'
							});
						});
					});
				});
			});

			describe("sceneReferences", () => {
				it("returns all scene references", () => {
					const initialState: ClientState = {
						...defaultState,
						models: {
							applicationModel: {
								...defaultState.models.applicationModel,
								content: {
									...defaultState.models.applicationModel.content,
									modules: [
										{
											name: "Dummy Module",
											menu: { name: "Dummy" },
											flows: [
												{
													name: "DummyFlow1",
													scenes: [
														{ name: "DummyOverview", matchConditions: [] },
														{ name: "DummyOverview2", matchConditions: [] }
													]
												},
												{
													name: "DummyFlow2",
													scenes: [{ name: "DummyForm", matchConditions: [] }]
												}
											]
										},
										{
											name: "Dummy Module",
											menu: {
												name: "dummy",
												label: [{ locale: "en", text: "Dummy" }],
												initialActivity: undefined
											},
											flows: [
												{
													name: "DummyFlow1",
													scenes: [{ name: "DummyOverview", matchConditions: [] }]
												}
											]
										}
									]
								}
							},
							modelGraph: {
								documentModels: [],
								relationshipModels: [],
								composeDocumentModels: []
							},
							models: {}
						}
					};

					const result = InternalModelSelectors.sceneReferences()(initialState);

					strictEqual(result.length, 4);
					deepStrictEqual(result, [
						{
							moduleName: "Dummy Module",
							flowName: "DummyFlow1",
							sceneName: "DummyOverview"
						},
						{
							moduleName: "Dummy Module",
							flowName: "DummyFlow1",
							sceneName: "DummyOverview2"
						},
						{
							moduleName: "Dummy Module",
							flowName: "DummyFlow2",
							sceneName: "DummyForm"
						},
						{
							moduleName: "Dummy Module",
							flowName: "DummyFlow1",
							sceneName: "DummyOverview"
						}
					]);
				});
			});

			describe("priorScenes", () => {
				it("returns all scene references", () => {
					const scenes = [
						{
							name: "Dummy Module",
							cases: [],
							matchConditions: []
						},
						{
							name: "DummyOverview",
							cases: [],
							matchConditions: [],
							priorScene: "Dummy Module"
						}
					];

					const initialState = createState({ scenes });

					const result = InternalModelSelectors.priorScenes(defaultSceneReference)(initialState);

					strictEqual(result.length, 1, "Expected to find one prior scene");
					deepStrictEqual(result[0].name, "Dummy Module");
				});
			});

			describe("caze", () => {
				describe("given a case name", () => {
					it("returns the first matching case", () => {
						const scene: ApplicationModel.Scene = {
							name: "DummyOverview",
							defaultCase: "viewsConcept",
							matchConditions: [],
							cases: [
								{
									name: "case1",
									label: [{ locale: "en", text: "Case 1" }],
									sceneChange: {}
								},
								{
									name: "case1",
									label: [{ locale: "en", text: "Case 2" }],
									sceneChange: {}
								}
							]
						};

						const result = InternalModelSelectors.caze("case1")(scene);

						deepStrictEqual(result, {
							name: "case1",
							label: [{ locale: "en", text: "Case 1" }],
							sceneChange: {}
						});
					});
				});
			});

			describe("uiModelAndDocumentModelLoaded", () => {
				function createState() {
					const model1 = {
						header: {
							id: "document1",
							modelType: "document",
							modelVersion: ""
						},
						content: {},
						generatedCodeAccessor: {}
					} as ModelAPI;

					const model2 = {
						header: {
							id: "uiModel",
							modelType: "overview",
							modelVersion: "",
							modelReferences: [{ reference: "document1", modelType: "document" }]
						},
						content: {},
						generatedCodeAccessor: {}
					} as ModelAPI;

					const model3 = {
						header: {
							id: "uiModelWithErrorDoc",
							modelType: "overview",
							modelVersion: "",
							modelReferences: [{ reference: "errorModelId", modelType: "document" }]
						},
						content: {},
						generatedCodeAccessor: {}
					} as ModelAPI;

					const model4 = {
						header: {
							id: "uiModelWithUnexistingDoc",
							modelType: "overview",
							modelVersion: "",
							modelReferences: [{ reference: "notExistingDoc", modelType: "document" }]
						},
						content: {},
						generatedCodeAccessor: {}
					} as ModelAPI;

					const modelError = {
						type: "NOT_FOUND"
					} as Model.Error;

					const { store } = createGeneralStore({
						modelMap: {
							[model1.header.id]: model1,
							[model2.header.id]: model2,
							[model3.header.id]: model3,
							[model4.header.id]: model4,
							errorModelId: modelError
						}
					});

					return { state: store.getState(), modelError, model1, model2 };
				}

				describe("returns stateChanged 'true' and loaded models as returnValue", () => {
					it("when ui model and document model are loaded and no typeguard was given", () => {
						const { state, model1, model2 } = createState();
						const { stateChanged, returnValue } =
							InternalModelSelectors.uiModelAndDocumentModelLoaded("uiModel")(state);

						strictEqual(stateChanged, true);
						deepStrictEqual(returnValue, {
							uiModel: model2,
							documentAndValidationModel: model1
						});
					});

					it("when ui model and document model are loaded and the given typeguard matched", () => {
						const { state, model1, model2 } = createState();
						const { stateChanged, returnValue } =
							InternalModelSelectors.uiModelAndDocumentModelLoaded(
								"uiModel",
								isOverviewModel
							)(state);

						strictEqual(stateChanged, true);
						deepStrictEqual(returnValue, {
							uiModel: model2,
							documentAndValidationModel: model1
						});
					});
				});

				describe("returns stateChanged 'true' and model error as returnValue", () => {
					it("when the ui model is not loaded and has an error", () => {
						const { state, modelError } = createState();
						const { stateChanged, returnValue } =
							InternalModelSelectors.uiModelAndDocumentModelLoaded("errorModelId")(state);

						strictEqual(stateChanged, true);
						deepStrictEqual(returnValue, modelError);
					});

					it("when the ui model is loaded and does not match the given typeGuard", () => {
						const { state } = createState();
						const { stateChanged, returnValue } =
							InternalModelSelectors.uiModelAndDocumentModelLoaded(
								"uiModel",
								(m): m is ModelAPI => m.header.modelType === "nomatch"
							)(state);

						strictEqual(stateChanged, true);
						deepStrictEqual(returnValue, {
							type: "UNEXPECTED_TYPE",
							message: `Expected type of model "uiModel" to match the given typeGuard.`
						});
					});

					it("when the document model is not loaded and has an error", () => {
						const { state, modelError } = createState();
						const { stateChanged, returnValue } =
							InternalModelSelectors.uiModelAndDocumentModelLoaded("uiModelWithErrorDoc")(state);

						strictEqual(stateChanged, true);
						deepStrictEqual(returnValue, modelError);
					});
				});

				describe("returns stateChanged 'false' and returnValue 'undefined'", () => {
					it("when no loaded ui model is found", () => {
						const { state } = createState();
						const { stateChanged, returnValue } =
							InternalModelSelectors.uiModelAndDocumentModelLoaded("notExisting")(state);

						strictEqual(stateChanged, false);
						strictEqual(returnValue, undefined);
					});

					it("when ui model is loaded and found in store, but no loaded document model is found", () => {
						const { state } = createState();
						const { stateChanged, returnValue } =
							InternalModelSelectors.uiModelAndDocumentModelLoaded("uiModelWithUnexistingDoc")(
								state
							);

						strictEqual(stateChanged, false);
						strictEqual(returnValue, undefined);
					});
				});
			});
		});

		function createState(options: {
			setOnExit?: boolean;
			modelDescriptors?: Model.Descriptor[];
			scenes?: ReadonlyArray<ApplicationModel.Scene>;
			caseModelDescriptors?: Model.Descriptor[];
			case?: string;
		}): ClientState {
			const directive: ReadonlyArray<ApplicationModel.Directive> = [
				{
					type: "REGION_CLEAR"
				},
				{
					type: "VIEW_ADD",
					name: "OverviewCRUD",
					models: options.modelDescriptors || [defaultModelDescriptor]
				}
			];
			return {
				...defaultState,
				models: {
					applicationModel: {
						...defaultState.models.applicationModel,
						content: {
							...defaultState.models.applicationModel.content,
							modules: [
								{
									name: "Dummy Module",
									menu: { name: "Dummy" },
									flows: [
										{
											name: "DummyFlow1",
											scenes: options.scenes || [
												{
													name: "DummyOverview",
													matchConditions: [
														{
															key: "model",
															mustEqual: "CRUD"
														},
														{
															key: "instance",
															isSet: false
														}
													],
													defaultCase: "defaultCase",
													sceneChange: {
														...(options.setOnExit === undefined
															? { onEnter: directive }
															: undefined),
														...(options.setOnExit ? { onExit: directive } : undefined)
													},
													cases: [
														{
															name: options.case ?? "defaultCase",
															sceneChange: {
																onEnter: [
																	{
																		type: "VIEW_ADD",
																		name: "OverviewCRUD",
																		...(options.caseModelDescriptors
																			? { models: options.caseModelDescriptors }
																			: undefined)
																	}
																]
															}
														}
													]
												}
											]
										}
									]
								}
							]
						}
					},
					modelGraph: {
						documentModels: [],
						relationshipModels: [],
						composeDocumentModels: []
					},
					models: {}
				}
			};
		}
	});
});
