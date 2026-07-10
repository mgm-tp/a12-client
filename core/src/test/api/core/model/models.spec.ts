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

import type { Header, Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api";

import type { Activity } from "../../../../core/activity/index.js";
import {
	ApplicationModel,
	Model,
	ModelActions,
	ModelSelectors
} from "../../../../core/model/index.js";
import type { ModelState } from "../../../../core/model/internal/ModelState.js";
import { modelWithOutSubRegions } from "../../../mocks/frame/storeMocks.js";
import { isFormModel, isOverviewModel } from "../../../mocks/ModelsUtil.js";
import { createGeneralStore } from "../../../mocks/store/store.js";
import { createStoreForTest } from "../../../unit/core/frame/utils.js";
import { createActivity } from "../../../utils/activity.js";
import {
	createAppModel,
	createContent,
	createHeader,
	createMenu,
	createModule,
	createScene
} from "../../../utils/appmodel-utils.js";
import { US_LOCALE } from "../../../utils/localization.js";
import type { ClientState } from "../../../utils/test-utils.js";

describe("core.model", () => {
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
		models: {}
	};

	function createModel(modelType: string, modelName = "modelName"): ModelAPI {
		const header: Header = {
			id: modelName,
			modelType,
			modelVersion: "0.0.0"
		};
		if ("documentValidation" === modelType) {
			return {
				header: {
					...header,
					modelType: "document"
				},
				content: {
					modelConfig: {},
					modelInfo: {},
					modelRoot: {}
				},
				generatedCodeAccessor: {}
			} as Model.DocumentAndValidationModel;
		}
		return {
			header,
			content: {
				modelName: modelName
			}
		};
	}

	describe("Model", () => {
		describe("isDocumentAndValidationModel", () => {
			describe("Given a model of type document", () => {
				const model = createModel("document");

				it("returns false if generatedCodeAccessor is undefined", () => {
					strictEqual(Model.isDocumentAndValidationModel(model), false);
				});

				it("returns true if generatedCodeAccessor is not undefined", () => {
					const extendedModel = { ...model, generatedCodeAccessor: {} };

					strictEqual(Model.isDocumentAndValidationModel(extendedModel), true);
				});
			});

			describe("Given a model that is not of type data", () => {
				const model = createModel("form");

				it("returns false", () => {
					strictEqual(Model.isDocumentAndValidationModel(model), false);
				});
			});
		});
	});

	describe("ApplicationModel", () => {
		describe("getKey", () => {
			it(`returns the key of the schema "application-model.{application-model-name}"`, () => {
				const modelName = "fooBar";
				const model = createAppModel({ header: createHeader({ id: modelName }) });

				strictEqual(ApplicationModel.getKey(model), `application-model.${modelName}`);
			});
		});

		describe("Module", () => {
			describe("getKey", () => {
				it(`returns the key of the schema "application-model.{application-model-name}.{module-name}"`, () => {
					const moduleName = "fooBar";
					const module = createModule({ name: moduleName });

					const model = createAppModel({
						header: createHeader({ id: "appmodel" })
					});

					strictEqual(
						ApplicationModel.Module.getKey(model, module),
						`${ApplicationModel.getKey(model)}.${moduleName}`
					);
				});
			});
		});

		describe("Region", () => {
			describe("Reference", () => {
				describe("name", () => {
					describe("Given a region reference with three values", () => {
						const lastValue = "ref3";
						const reference = ["ref1", "ref2", lastValue];
						const name = ApplicationModel.Region.Reference.name(reference);

						it("returns the last value", () => {
							strictEqual(name, lastValue);
						});
					});
				});

				describe("equal", () => {
					const firstReference = ["ref1", "ref2", "ref3"];
					const secondReference = ["ref1", "ref2", "ref3"];
					const thirdReference = ["ref3", "ref2", "ref1"];
					const fourthReference = ["ref1"];

					describe("Given two region references that are equal", () => {
						const result = ApplicationModel.Region.Reference.equal(firstReference, secondReference);

						it("returns true", () => {
							strictEqual(result, true);
						});
					});

					describe("Given two region references with the same length but different values", () => {
						const result = ApplicationModel.Region.Reference.equal(firstReference, thirdReference);

						it("returns false", () => {
							strictEqual(result, false);
						});
					});

					describe("Given two region references with different length", () => {
						const result = ApplicationModel.Region.Reference.equal(firstReference, fourthReference);

						it("returns false", () => {
							strictEqual(result, false);
						});
					});
				});
			});
		});

		describe("Menu", () => {
			describe("getKey", () => {
				it(`returns the key of the schema "application-model.{application-model-name}.{module-name}(.{menu-name})*"`, () => {
					const module = createModule({ name: "module" });

					const model = createAppModel({
						header: createHeader({ id: "appmodel" })
					});

					const menuName = "fooBar";
					const menu = createMenu({ name: menuName });

					strictEqual(
						ApplicationModel.Menu.getKey(model, module, [menu]),
						`${ApplicationModel.Module.getKey(model, module)}.${menuName}`
					);

					const subMenuName = "barBaz";
					const subMenu = createMenu({ name: subMenuName });

					strictEqual(
						ApplicationModel.Menu.getKey(model, module, [menu, subMenu]),
						`${ApplicationModel.Module.getKey(model, module)}.${menuName}.${subMenuName}`
					);
				});
			});
		});

		describe("SceneReference", () => {
			describe("getKey", () => {
				it(
					`returns the key of the schema` +
						` "application-model.{application-model-name}.{module-name}.{flow-name}.{scene-name}"`,
					() => {
						const model = createAppModel({
							header: createHeader({ id: "appmodel" })
						});

						const moduleName = "foo";
						const flowName = "bar";
						const sceneName = "baz";
						const sceneReference: ApplicationModel.SceneReference = {
							moduleName,
							flowName,
							sceneName
						};

						strictEqual(
							ApplicationModel.SceneReference.getKey(model, sceneReference),
							`${ApplicationModel.getKey(model)}.${moduleName}.${flowName}.${sceneName}`
						);
					}
				);
			});
		});

		describe("Case", () => {
			describe("getKey", () => {
				it(
					`returns the key of the schema` +
						` "application-model.{application-model-name}.{module-name}.{flow-name}.{scene-name}.{case-name}"`,
					() => {
						const model = createAppModel({
							header: createHeader({ id: "appmodel" })
						});

						const sceneReference: ApplicationModel.SceneReference = {
							moduleName: "m",
							flowName: "f",
							sceneName: "s"
						};

						const caseName = "fooBar";
						const caze: ApplicationModel.Case = { name: caseName };

						strictEqual(
							ApplicationModel.Case.getKey(model, sceneReference, caze),
							`${ApplicationModel.SceneReference.getKey(model, sceneReference)}.${caseName}`
						);
					}
				);
			});
		});

		describe("MatchCondition", () => {
			describe("Equality", () => {
				describe("isInstance", () => {
					describe("Given an object that is an instance of MatchCondition.Equality", () => {
						const obj: ApplicationModel.MatchCondition.Equality = {
							mustEqual: "a value",
							key: "A"
						};
						const result = ApplicationModel.MatchCondition.Equality.isInstance(obj);

						it("returns true", () => {
							strictEqual(result, true);
						});
					});

					describe("Given an object that is not an instance of MatchCondition.Equality", () => {
						const result = ApplicationModel.MatchCondition.Equality.isInstance({
							key: "A"
						});

						it("returns false", () => {
							strictEqual(result, false);
						});
					});
				});
			});

			describe("Existence", () => {
				describe("isInstance", () => {
					describe("Given an object that is an instance of MatchCondition.Existence", () => {
						const obj: ApplicationModel.MatchCondition.Existence = {
							isSet: true,
							key: "A"
						};
						const result = ApplicationModel.MatchCondition.Existence.isInstance(obj);

						it("returns true", () => {
							strictEqual(result, true);
						});
					});

					describe("Given an object that is not an instance of MatchCondition.Existence", () => {
						const result = ApplicationModel.MatchCondition.Existence.isInstance({ key: "A" });

						it("returns false", () => {
							strictEqual(result, false);
						});
					});
				});
			});

			describe("evaluate", () => {
				function setupDescriptor(key: string, value: string | undefined): Activity.Descriptor {
					return { [key]: value };
				}

				describe("Given an Equality state match ", () => {
					const equalityMatchCondition: ApplicationModel.MatchCondition.Equality = {
						key: "model",
						mustEqual: "Offer"
					};

					describe("and an activity descriptor with a matching property for the given key", () => {
						const descriptor = setupDescriptor(
							equalityMatchCondition.key,
							equalityMatchCondition.mustEqual
						);

						it("returns true", () => {
							strictEqual(
								ApplicationModel.MatchCondition.evaluate(equalityMatchCondition, descriptor),
								true
							);
						});
					});

					describe("and an activity descriptor without a matching property for the given key", () => {
						const descriptor = setupDescriptor(equalityMatchCondition.key, undefined);

						it("returns false", () => {
							strictEqual(
								ApplicationModel.MatchCondition.evaluate(equalityMatchCondition, descriptor),
								false
							);
						});
					});
				});

				describe("Given an Existence state match with isSet 'true' for a given key", () => {
					const existenceMatchCondition: ApplicationModel.MatchCondition.Existence = {
						key: "instance",
						isSet: true
					};

					describe("and an activity descriptor with a matching property for the given key", () => {
						const descriptor = setupDescriptor(existenceMatchCondition.key, "some value");

						it("returns true", () => {
							strictEqual(
								ApplicationModel.MatchCondition.evaluate(existenceMatchCondition, descriptor),
								true
							);
						});
					});

					describe("and an activity descriptor without a matching property for the given key", () => {
						const descriptor = setupDescriptor(existenceMatchCondition.key, undefined);

						it("returns false", () => {
							strictEqual(
								ApplicationModel.MatchCondition.evaluate(existenceMatchCondition, descriptor),
								false
							);
						});
					});
				});

				describe("Given an Existence state match with isSet 'false' for a given key", () => {
					const existenceMatchCondition: ApplicationModel.MatchCondition.Existence = {
						key: "instance",
						isSet: false
					};

					describe("and an activity descriptor with a matching property for the given key", () => {
						const descriptor = setupDescriptor(existenceMatchCondition.key, "some value");

						it("returns false", () => {
							strictEqual(
								ApplicationModel.MatchCondition.evaluate(existenceMatchCondition, descriptor),
								false
							);
						});
					});

					describe("and an activity descriptor without a matching property for the given key", () => {
						const descriptor = setupDescriptor(existenceMatchCondition.key, undefined);

						it("returns true", () => {
							strictEqual(
								ApplicationModel.MatchCondition.evaluate(existenceMatchCondition, descriptor),
								true
							);
						});
					});
				});

				describe("Given a MatchCondition which is neither Existence nor Equality and any activity descriptor", () => {
					// this is a fake state matcher which does not exist in the client
					const anyMatchCondition: any = { key: "length", isPositive: true };
					const descriptor = setupDescriptor(anyMatchCondition.key, undefined);

					it("always returns true", () => {
						strictEqual(
							ApplicationModel.MatchCondition.evaluate(anyMatchCondition, descriptor),
							true
						);
					});
				});
			});
		});
	});

	describe("ModelActions", () => {
		describe("When the ActionCreator setApplicationModel is called with an application model", () => {
			const expectedPayload: ModelActions.SetApplicationModelPayload = {
				model: state.applicationModel
			};

			const action = ModelActions.setApplicationModel(expectedPayload);

			it("returns an action of this type with the given application model as payload", () => {
				deepStrictEqual(action, {
					type: ModelActions.setApplicationModel.type,
					payload: expectedPayload
				});
			});
		});
	});

	describe("ModelSelectors", () => {
		const activity = createActivity({
			id: "1",
			descriptor: { feature: "crudOverview1", model: "secondModel-doc" }
		});
		const defaultState: Partial<ClientState> = {
			activities: {
				[activity.id]: activity
			},
			models: {
				applicationModel: modelWithOutSubRegions,
				models: {},
				modelGraph: { documentModels: [], relationshipModels: [], composeDocumentModels: [] }
			},
			locale: US_LOCALE,
			application: { busy: false, registeredModules: [] }
		};
		describe("Note: all selector factories return functions which return the objects described below", () => {
			describe("applicationModel", () => {
				it("returns the ApplicationModel from a given state object", () => {
					const store = createStoreForTest({ appModel: modelWithOutSubRegions });
					const applicationModel = ModelSelectors.applicationModel()(store.getState());
					deepStrictEqual(applicationModel, modelWithOutSubRegions, "Wrong application model");
				});
			});

			describe("modelLoaded", () => {
				function createStoreWithModels() {
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
							id: "overview1",
							modelType: "overview",
							modelVersion: ""
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
							errorModelId: modelError
						}
					});

					return {
						store,
						model1,
						model2,
						modelError
					};
				}

				describe("returns stateChanged 'false' and returnValue 'undefined'", () => {
					it("when the model is not loaded and has no error", () => {
						const { store } = createStoreWithModels();

						const { stateChanged, returnValue } = ModelSelectors.modelLoaded("notExisting")(
							store.getState()
						);
						strictEqual(stateChanged, false);
						strictEqual(returnValue, undefined);
					});
				});

				describe("returns stateChanged 'true' and model error as returnValue", () => {
					it("when the model is not loaded and has an error", () => {
						const { store, modelError } = createStoreWithModels();

						const { stateChanged, returnValue } = ModelSelectors.modelLoaded("errorModelId")(
							store.getState()
						);
						strictEqual(stateChanged, true);
						deepStrictEqual(returnValue, modelError);
					});

					it("when the model is loaded and does not match the given typeGuard", () => {
						const { store } = createStoreWithModels();

						const { stateChanged, returnValue } = ModelSelectors.modelLoaded(
							"document1",
							isFormModel
						)(store.getState());
						strictEqual(stateChanged, true);
						deepStrictEqual(returnValue, {
							type: "UNEXPECTED_TYPE",
							message: `Expected type of model "document1" to match the given typeGuard.`
						});
					});
				});

				describe("returns stateChanged 'true' and loaded model as returnValue", () => {
					it("when the model is loaded and no typeguard was given", () => {
						const { model1, store } = createStoreWithModels();

						const { stateChanged, returnValue } = ModelSelectors.modelLoaded("document1")(
							store.getState()
						);
						strictEqual(stateChanged, true);
						deepStrictEqual(returnValue, { model: model1 });
					});

					it("when the model is loaded and the given typeguard matched", () => {
						const { model2, store } = createStoreWithModels();

						const { stateChanged, returnValue } = ModelSelectors.modelLoaded(
							"overview1",
							isOverviewModel
						)(store.getState());
						strictEqual(stateChanged, true);
						deepStrictEqual(returnValue, { model: model2 });
					});
				});
			});

			describe("modelByName", () => {
				const state = {
					...defaultState,
					models: {
						...defaultState.models,
						models: {
							firstModel: createModel("overview", "firstModel"),
							secondModel: createModel("overview", "secondModel"),
							thirdModel: { type: "UNKNOWN" }
						}
					}
				};

				it("returns the model for the given model name if the model is present in the store", () => {
					const resultModel = ModelSelectors.modelByName("firstModel")(state);

					strictEqual(
						resultModel,
						state.models.models.firstModel,
						"Expected a model to be returned"
					);
				});

				it("returns undefined if the model is not present in the store", () => {
					const resultModel = ModelSelectors.modelByName("fourthModel")(state);
					strictEqual(resultModel, undefined, "Expected undefined to be returned");
				});

				it("returns undefined if an error is present for the given model name", () => {
					const resultModel = ModelSelectors.modelByName("thirdModel")(state);
					strictEqual(resultModel, undefined, "Expected undefined to be returned");
				});
			});

			describe("modelErrorByName", () => {
				const state = {
					...defaultState,
					models: {
						...defaultState.models,
						models: {
							firstModel: createModel("overview", "firstModel"),
							secondModel: createModel("overview", "secondModel"),
							thirdModel: { type: "UNKNOWN" }
						}
					}
				};

				it("returns undefined if the model is present in the store", () => {
					const resultModel = ModelSelectors.modelErrorByName("firstModel")(state);
					strictEqual(resultModel, undefined, "Expected undefined to be returned");
				});

				it("returns undefined if the model is not present in the store", () => {
					const resultModel = ModelSelectors.modelErrorByName("fourthModel")(state);
					strictEqual(resultModel, undefined, "Expected undefined to be returned");
				});

				it("returns the error for the given model name if it is present", () => {
					const resultModel = ModelSelectors.modelErrorByName("thirdModel")(state);
					strictEqual(
						resultModel,
						state.models.models.thirdModel,
						"Expected a model error to be returned"
					);
				});
			});

			describe("modelInScene", () => {
				const state = {
					...defaultState,
					models: {
						applicationModel: createAppModel({
							content: createContent({
								modules: [
									createModule({
										flows: [
											{
												name: "Flow1",
												scenes: [
													createScene({
														matchConditions: [
															{
																key: "feature",
																mustEqual: "crudOverview1"
															}
														],
														onEnterDirectives: [
															{
																type: "VIEW_ADD",
																name: "",
																models: [
																	{
																		modelType: "overview",
																		name: "firstModel"
																	},
																	{
																		modelType: "overview",
																		name: "secondModel",
																		documentModel: "secondModel-doc"
																	},
																	{
																		modelType: "relationship",
																		name: "thirdModel"
																	}
																]
															}
														]
													})
												]
											}
										]
									})
								]
							})
						}),
						models: {
							firstModel: createModel("overview", "firstModel"),
							secondModel: createModel("overview", "secondModel"),
							thirdModel: { type: "UNKNOWN" }
						}
					}
				};

				it("returns the first model of the scene that matches modelType", () => {
					const resultModel = ModelSelectors.modelInScene({
						activityId: activity.id,
						modelType: "overview"
					})(state);
					strictEqual(
						resultModel,
						state.models.models.firstModel,
						"Expected the first overview model to be returned"
					);
				});

				it("returns the first model of the scene that matches modelType and documentModel", () => {
					const resultModel = ModelSelectors.modelInScene({
						activityId: activity.id,
						modelType: "overview",
						documentModel: "secondModel-doc"
					})(state);
					strictEqual(
						resultModel,
						state.models.models.secondModel,
						"Expected the second overview model to be returned"
					);
				});

				it("returns undefined if the model is not present in the scene", () => {
					const resultModel = ModelSelectors.modelInScene({
						activityId: activity.id,
						modelType: "form"
					})(state);
					strictEqual(resultModel, undefined, "Expected undefined to be returned");
				});

				it("returns undefined if the given typeGuard does not match", () => {
					const resultModel = ModelSelectors.modelInScene(
						{ activityId: activity.id, modelType: "overview" },
						(m): m is ModelAPI => m.header.modelType === "nomatch"
					)(state);
					strictEqual(resultModel, undefined, "Expected undefined to be returned");
				});

				it("returns undefined if the model is present in the scene, but has an error", () => {
					const resultModel = ModelSelectors.modelInScene({
						activityId: activity.id,
						modelType: "relationship"
					})(state);
					strictEqual(resultModel, undefined, "Expected undefined to be returned");
				});
			});

			describe("modelErrorInScene", () => {
				const state = {
					...defaultState,
					models: {
						applicationModel: createAppModel({
							content: createContent({
								modules: [
									createModule({
										flows: [
											{
												name: "Flow1",
												scenes: [
													createScene({
														matchConditions: [
															{
																key: "feature",
																mustEqual: "crudOverview1"
															}
														],
														onEnterDirectives: [
															{
																type: "VIEW_ADD",
																name: "",
																models: [
																	{
																		modelType: "overview",
																		name: "firstModel"
																	},
																	{
																		modelType: "relationship",
																		name: "thirdModel"
																	}
																]
															}
														]
													})
												]
											}
										]
									})
								]
							})
						}),
						models: {
							firstModel: createModel("overview", "firstModel"),
							secondModel: createModel("overview", "secondModel"),
							thirdModel: { type: "UNKNOWN" }
						}
					}
				};

				it("returns undefined if the model is present in the scene", () => {
					const modelError = ModelSelectors.modelErrorInScene({
						activityId: activity.id,
						modelType: "overview"
					})(state);
					strictEqual(modelError, undefined, "Expected undefined to be returned");
				});

				it("returns undefined if the model is not present in the scene", () => {
					const modelError = ModelSelectors.modelErrorInScene({
						activityId: activity.id,
						modelType: "form"
					})(state);
					strictEqual(modelError, undefined, "Expected undefined to be returned");
				});

				it("returns the error for the model that is present in the scene", () => {
					const modelError = ModelSelectors.modelErrorInScene({
						activityId: activity.id,
						modelType: "relationship"
					})(state);
					strictEqual(
						modelError,
						state.models.models.thirdModel,
						"Expected a model error to be returned"
					);
				});
			});

			describe("region", () => {
				describe("given a region reference", () => {
					it("returns, if present, the matching sub-region", () => {
						const state = {
							...defaultState,
							models: {
								applicationModel: {
									header: {
										id: "COSMO_A12",
										modelType: "application",
										modelVersion: "1.0.0"
									},
									content: {
										region: {
											name: "APP",
											layout: { name: "ApplicationFrameMock" },
											subRegions: [
												{ name: "SIDEBAR", layout: { name: "NullMock" } },
												{
													name: "CONTENT",
													layout: { name: "MasterDetailMock" },
													subRegions: [
														{
															name: "SUB-REGION-1",
															layout: { name: "MasterDetail" },
															subRegions: [
																{
																	name: "SUB-SUB-REGION-1-1",
																	layout: { name: "NullMock" }
																},
																{
																	name: "SUB-SUB-REGION-1-2",
																	layout: { name: "NullMock" }
																}
															]
														},
														{
															name: "SUB-REGION-2",
															layout: { name: "MasterDetail" },
															subRegions: [
																{
																	name: "SUB-SUB-REGION-2-1",
																	layout: { name: "SpecialLayout" }
																},
																{
																	name: "SUB-SUB-REGION-2-2",
																	layout: { name: "NullMock" }
																}
															]
														}
													]
												}
											]
										},
										defaultRegion: ["CONTENT"],
										modules: []
									}
								} as ApplicationModel,
								models: {}
							}
						};

						const result = ModelSelectors.region(["CONTENT", "SUB-REGION-2", "SUB-SUB-REGION-2-1"])(
							state
						);
						notStrictEqual(result, undefined, "Expected a region to be returned");
						deepStrictEqual(result, {
							name: "SUB-SUB-REGION-2-1",
							layout: { name: "SpecialLayout" }
						});
					});

					it("returns nothing, if the sub-region can not be matched with the region reference", () => {
						const state = {
							...defaultState,
							models: {
								applicationModel: {
									header: {
										id: "COSMO_A12",
										modelType: "application",
										modelVersion: "1.0.0"
									},
									content: {
										region: {
											name: "APP",
											layout: { name: "ApplicationFrameMock" },
											subRegions: [
												{ name: "SIDEBAR", layout: { name: "NullMock" } },
												{
													name: "CONTENT",
													layout: { name: "MasterDetailMock" },
													subRegions: []
												}
											]
										},
										defaultRegion: ["CONTENT"],
										modules: []
									}
								} as ApplicationModel,
								models: {}
							}
						};

						const result = ModelSelectors.region(["CONTENT", "SUB-REGION-2", "SUB-SUB-REGION-2-1"])(
							state
						);
						strictEqual(result, undefined, "Expected no region to be returned");
					});
				});
			});

			describe("subRegionRefs", () => {
				describe("given a region reference", () => {
					it("returns, if present, an array of sub region references, of the region reference", () => {
						const state = {
							...defaultState,
							models: {
								applicationModel: {
									header: {
										id: "COSMO_A12",
										modelType: "application",
										modelVersion: "1.0.0"
									},
									content: {
										region: {
											name: "APP",
											layout: { name: "ApplicationFrameMock" },
											subRegions: [
												{ name: "SIDEBAR", layout: { name: "NullMock" } },
												{
													name: "CONTENT",
													layout: { name: "MasterDetailMock" },
													subRegions: [
														{
															name: "SUB-REGION-1",
															layout: { name: "MasterDetail" },
															subRegions: [
																{
																	name: "SUB-SUB-REGION-1-1",
																	layout: { name: "NullMock" }
																},
																{
																	name: "SUB-SUB-REGION-1-2",
																	layout: { name: "NullMock" }
																}
															]
														},
														{
															name: "SUB-REGION-2",
															layout: { name: "MasterDetail" },
															subRegions: [
																{
																	name: "SUB-SUB-REGION-2-1",
																	layout: { name: "SpecialLayout" }
																},
																{
																	name: "SUB-SUB-REGION-2-2",
																	layout: { name: "NullMock" }
																}
															]
														}
													]
												}
											]
										},
										defaultRegion: ["CONTENT"],
										modules: []
									}
								} as ApplicationModel,
								models: {}
							}
						};

						const result = ModelSelectors.subRegionRefs(["CONTENT", "SUB-REGION-2"])(state);
						notStrictEqual(result, undefined, "Expected a region to be returned");
						deepStrictEqual(result, [
							["CONTENT", "SUB-REGION-2", "SUB-SUB-REGION-2-1"],
							["CONTENT", "SUB-REGION-2", "SUB-SUB-REGION-2-2"]
						]);
					});

					it("throws an error if no region matches the region reference", () => {
						const state = {
							...defaultState,
							models: {
								applicationModel: {
									header: {
										id: "COSMO_A12",
										modelType: "application",
										modelVersion: "1.0.0"
									},
									content: {
										region: {
											name: "APP",
											layout: { name: "ApplicationFrameMock" },
											subRegions: [
												{ name: "SIDEBAR", layout: { name: "NullMock" } },
												{
													name: "CONTENT",
													layout: { name: "MasterDetailMock" },
													subRegions: []
												}
											]
										},
										defaultRegion: ["CONTENT"],
										modules: []
									}
								} as ApplicationModel,
								models: {}
							}
						};
						throws(
							() =>
								ModelSelectors.subRegionRefs(["CONTENT", "SUB-REGION-2", "SUB-SUB-REGION-2-1"])(
									state
								),
							{ message: "region not found: " + ["CONTENT", "SUB-REGION-2", "SUB-SUB-REGION-2-1"] }
						);
					});
				});
			});
		});
	});
});
