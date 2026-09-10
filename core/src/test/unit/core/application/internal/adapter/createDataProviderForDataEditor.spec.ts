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

import { deepStrictEqual, fail, notStrictEqual, strictEqual } from "node:assert/strict";
import type { Mock } from "node:test";
import { mock } from "node:test";

import { expectSaga } from "redux-saga-test-plan";
import { call } from "redux-saga-test-plan/matchers.js";
import { throwError } from "redux-saga-test-plan/providers.js";
import type { PutEffect } from "redux-saga/effects";
import type { Action, AnyAction } from "typescript-fsa";

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";

import type { Activity, ActivityMap } from "../../../../../../core/activity/index.js";
import { ActivityActions, ActivitySelectors } from "../../../../../../core/activity/index.js";
import { createDataProviderForDataEditors } from "../../../../../../core/application/internal/adapter/createDataProviderForDataEditors.js";
import type { DataEditor, DataProvider } from "../../../../../../core/data/index.js";
import { ModelActions, ModelSagas } from "../../../../../../core/model/index.js";
import {
	InternalModelSelectors,
	ModelSelectors
} from "../../../../../../core/model/internal/selectors.js";
import type { DeepWriteable } from "../../../../../../core/utils.js";
import { ViewSelectors } from "../../../../../../core/view/index.js";
import { createActivity, createDataHolder } from "../../../../../utils/activity.js";
// FIXME: with A12C-2995 -> simplify test setup
// instead of mocking many (selector) stubs in global before that partially manipulated in it()s,
// create proper state and use .withState(testState) for expectSaga call
describe("core.application", () => {
	describe("adapter.createDataProviderForDataEditor", () => {
		describe("given a set of data holders which should be adapted, createDataProviderForDataEditor returns a data provider with", () => {
			let activitySetupResult: ActivitySetupResult;
			beforeEach(() => {
				activitySetupResult = setupActivitiesAndActivityMap();

				mock.method(console, "error", () => undefined);
			});

			describe("a canHandle function, which", () => {
				function executeCanHandleTest(
					dataEditors: DataEditor[],
					operation: "load" | "save" | "delete"
				): boolean {
					return createDataProviderForDataEditors(dataEditors).canHandle({
						activities: activitySetupResult.activities,
						activityId: "childActivityId",
						dataHolder: activitySetupResult.child.dataHolderMock,
						operation
					});
				}

				describe("given a data holder which should be loaded and a map of activities", () => {
					describe("and given a data editor with parent conditions which match one of the given activity descriptors", () => {
						describe("and with child conditions which match the descriptor of the given data holder", () => {
							it("returns true", () => {
								const dataHandlers = setupDataEditors({
									childMatches: true,
									parentMatches: true
								});
								const result = executeCanHandleTest(dataHandlers, "load");
								deepStrictEqual(result, true);
							});
						});

						describe("and with child conditions which does not match the descriptor of the given data holder", () => {
							it("returns false", () => {
								const dataHandlers = setupDataEditors({
									childMatches: false,
									parentMatches: true
								});
								const result = executeCanHandleTest(dataHandlers, "load");
								deepStrictEqual(result, false);
							});
						});
					});

					describe("and given a data editor with parent conditions which do not match one of the given activity descriptors", () => {
						it("returns false", () => {
							const dataHandlers = setupDataEditors({
								childMatches: true,
								parentMatches: false
							});
							const result = executeCanHandleTest(dataHandlers, "load");
							deepStrictEqual(result, false);
						});
					});
				});

				describe("given a data holder which should be saved and a map of activities", () => {
					describe("and given a data editor with parent conditions which match one of the given activity descriptors", () => {
						describe("and with child conditions which match the descriptor of the given data holder", () => {
							it("returns true", () => {
								const dataHandlers = setupDataEditors({
									childMatches: true,
									parentMatches: true
								});
								const result = executeCanHandleTest(dataHandlers, "save");
								deepStrictEqual(result, true);
							});
						});

						describe("and with child conditions which does not match the descriptor of the given data holder", () => {
							it("returns false", () => {
								const dataHandlers = setupDataEditors({
									childMatches: false,
									parentMatches: true
								});
								const result = executeCanHandleTest(dataHandlers, "save");
								deepStrictEqual(result, false);
							});
						});
					});

					describe("and given a data editor with parent conditions which do not match one of the given activity descriptors", () => {
						it("returns false", () => {
							const dataHandlers = setupDataEditors({
								childMatches: true,
								parentMatches: false
							});
							const result = executeCanHandleTest(dataHandlers, "save");
							deepStrictEqual(result, false);
						});
					});
				});

				describe("given a data holder which should be deleted and a map of activities", () => {
					it("returns false", () => {
						const dataHandlers = setupDataEditors({
							childMatches: true,
							parentMatches: true
						});
						const result = executeCanHandleTest(dataHandlers, "delete");
						deepStrictEqual(result, false);
					});
				});
			});

			describe("a provideData function, which", () => {
				const loadedModels = [{} as ModelAPI];

				let activityByIdSelectorStub: Mock<typeof ActivitySelectors.activityById>;

				beforeEach(() => {
					activityByIdSelectorStub = mock.method(
						ActivitySelectors,
						"activityById",
						() => () => activitySetupResult.child.activityMock
					);

					mock.method(ActivitySelectors, "activities", () => () => activitySetupResult.activities);
					mock.method(ActivitySelectors, "initiatingPath", () => () => []);
					mock.method(ViewSelectors, "sceneReferenceByActivityId", () => () => ({
						flowName: "DummyFlow",
						moduleName: "DummyModule",
						sceneName: "DummyScene"
					}));
					mock.method(InternalModelSelectors, "sceneReferenceByActivities", () => () => ({
						flowName: "DummyFlow",
						moduleName: "DummyModule",
						sceneName: "DummyScene"
					}));
					mock.method(ModelSelectors, "modelDescriptorsByActivityId", () => () => [
						{ modelType: "DummyModel", name: "DummyModel" }
					]);
				});

				describe("given a config with an activity id", () => {
					describe("and a load operation", () => {
						describe("and a data editor with child conditions which matches the given activity and parent conditions which matches any active activity", () => {
							describe("which is loaded", () => {
								it("reads the data from the parent activity and dispatches an action to set the data to the given activity", async () => {
									const dataToRead = { document: "Test" };
									const dataEditors = setupDataEditors({
										childMatches: true,
										parentMatches: true,
										readData: dataToRead
									});
									await executeProvideDataTest({
										operation: "load",
										dataEditors,
										loadedModels,
										assertion: (putEffects: PutEffect[]) => {
											strictEqual(putEffects.length, 1);

											assertSetDataActionPayload(putEffects, "childActivityId", {
												activityId: "childActivityId",
												data: dataToRead,
												datasourceActivityId: "parentActivityId"
											});
										}
									});
								});
							});

							describe("which is not loaded", () => {
								it("throws an error that the parent activity needs to be loaded", async () => {
									const dataEditors = setupDataEditors({
										childMatches: true,
										parentMatches: true
									});
									await executeProvideDataTest({
										operation: "load",
										dataEditors,
										loadedModels,
										parentActivityLoadingState: "loading",
										errorAssertion: error => {
											deepStrictEqual(error.message, 'Cannot handle parent loadingState "loading"');
										}
									});
								});
							});
						});

						describe("and no data editor with child conditions which matches the given activity", () => {
							it("throws an error that no matching data editor was found", async () => {
								const dataEditors = setupDataEditors({
									childMatches: false,
									parentMatches: true
								});
								await executeProvideDataTest({
									operation: "load",
									dataEditors,
									loadedModels,
									errorAssertion: error => {
										deepStrictEqual(
											error.message,
											'Could not find suitable data editor for activity {"test":"Test","instance":"1"}.'
										);
									}
								});
							});
						});

						describe("and no data editor with parent conditions which match any active activity", () => {
							it("throws an error that no matching data editor was found", async () => {
								const dataEditors = setupDataEditors({
									childMatches: true,
									parentMatches: false
								});
								await executeProvideDataTest({
									operation: "load",
									dataEditors,
									loadedModels,
									errorAssertion: error => {
										deepStrictEqual(
											error.message,
											'Could not find suitable data editor for activity {"test":"Test","instance":"1"}.'
										);
									}
								});
							});
						});
					});

					describe("and a save operation", () => {
						describe("and a data editor with child conditions which matches the given activity and parent conditions which matches any active activity", () => {
							describe("which is loaded", () => {
								it(
									"writes the data using the data editor, " +
										"dispatches an action to set the new data to the data source activity and make it dirty" +
										"and the saving done action from the config",
									async () => {
										const dataToWrite = { document: "Test" };
										const dataEditors = setupDataEditors({
											childMatches: true,
											parentMatches: true,
											writeData: dataToWrite
										});

										await executeProvideDataTest({
											operation: "save",
											dataEditors,
											loadedModels,
											assertion: (putEffects: PutEffect[]) => {
												strictEqual(putEffects.length, 2, "Expected two put actions");

												assertSetDataActionPayload(putEffects, "parentActivityId", {
													activityId: "parentActivityId",
													data: dataToWrite,
													dirty: true
												});
											}
										});
									}
								);

								describe("and updateActivityData=true", () => {
									it("writes the data for the parent activity using the data editor, without setting the data to the given child activity", async () => {
										const dataToWrite = { document: "Test" };
										const dataEditors = setupDataEditors({
											childMatches: true,
											parentMatches: true,
											writeData: dataToWrite
										});
										await executeProvideDataTest({
											operation: "save",
											updateActivityData: true,
											dataEditors,
											loadedModels,
											assertion: (putEffects: PutEffect[]) => {
												const setDataAction = findSetDataAction(putEffects, "childActivityId");
												strictEqual(setDataAction, undefined);
											}
										});
									});
								});

								describe("and the data is of type SingleDocumentData", () => {
									describe("and the document in the data has an id", () => {
										it("dispatches the saving.done action from the config with the id from the document", async () => {
											const dataToWrite = {
												document: { id: "document-1", modelId: "Dummy" }
											};
											const dataEditors = setupDataEditors({
												childMatches: true,
												parentMatches: true,
												writeData: dataToWrite
											});
											await executeProvideDataTest({
												operation: "save",
												dataEditors,
												loadedModels,
												assertion: (putEffects: PutEffect[]) => {
													strictEqual(putEffects.length, 2, "Expected two put actions");

													assertSetDataActionPayload(putEffects, "parentActivityId", {
														activityId: "parentActivityId",
														data: dataToWrite,
														dirty: true
													});
													assertSavingDonePayload(putEffects, { instance: "document-1" });
												}
											});
										});
									});

									describe("and the document in the data has no id", () => {
										it("dispatches the saving.done action from the config with no id", async () => {
											const dataToWrite = { document: { modelId: "Dummy" } };
											const dataEditors = setupDataEditors({
												childMatches: true,
												parentMatches: true,
												writeData: dataToWrite
											});
											await executeProvideDataTest({
												operation: "save",
												dataEditors,
												loadedModels,
												assertion: (putEffects: PutEffect[]) => {
													strictEqual(putEffects.length, 2, "Expected two put actions");

													assertSetDataActionPayload(putEffects, "parentActivityId", {
														activityId: "parentActivityId",
														data: dataToWrite,
														dirty: true
													});
													assertSavingDonePayload(putEffects, {});
												}
											});
										});
									});
								});

								describe("and the data is not of type SingleDocumentData", () => {
									it("dispatches the saving.done action from the config with no id", async () => {
										const dataToWrite = { document: { root: "Test" } };
										const dataEditors = setupDataEditors({
											childMatches: true,
											parentMatches: true,
											writeData: dataToWrite
										});
										await executeProvideDataTest({
											operation: "save",
											dataEditors,
											loadedModels,
											assertion: (putEffects: PutEffect[]) => {
												strictEqual(putEffects.length, 2, "Expected two put actions");

												assertSetDataActionPayload(putEffects, "parentActivityId", {
													activityId: "parentActivityId",
													data: dataToWrite,
													dirty: true
												});
												assertSavingDonePayload(putEffects, {});
											}
										});
									});
								});
							});

							describe("which is not loaded", () => {
								it("throws an error that the parent activity needs to be loaded", async () => {
									const dataEditors = setupDataEditors({
										childMatches: true,
										parentMatches: true
									});
									await executeProvideDataTest({
										operation: "save",
										parentActivityLoadingState: "loading",
										dataEditors,
										loadedModels,
										errorAssertion: error => {
											deepStrictEqual(error.message, 'Cannot handle parent loadingState "loading"');
										}
									});
								});
							});
						});

						describe("and no data editor with child conditions which match the given activity", () => {
							it("throws an error that no matching data editor was found", async () => {
								const dataEditors = setupDataEditors({
									childMatches: false,
									parentMatches: true
								});
								await executeProvideDataTest({
									operation: "save",
									dataEditors,
									loadedModels,
									errorAssertion: error => {
										deepStrictEqual(
											error.message,
											'Could not find suitable data editor for activity {"test":"Test","instance":"1"}.'
										);
									}
								});
							});
						});

						describe("and no data editor with parent conditions which match any active activity", () => {
							it("throws an error that no matching data editor was found", async () => {
								const dataEditors = setupDataEditors({
									childMatches: true,
									parentMatches: false
								});
								await executeProvideDataTest({
									operation: "save",
									dataEditors,
									loadedModels,
									errorAssertion: error => {
										deepStrictEqual(
											error.message,
											'Could not find suitable data editor for activity {"test":"Test","instance":"1"}.'
										);
									}
								});
							});
						});
					});
				});

				describe("and a delete operation", () => {
					it("throws an error that the operation is not supported", async () => {
						const dataEditors = setupDataEditors({
							childMatches: true,
							parentMatches: true
						});
						await executeProvideDataTest({
							operation: "delete",
							dataEditors,
							loadedModels,
							errorAssertion: error => {
								deepStrictEqual(error.message, "Data editors do not support delete operations.");
							}
						});
					});
				});

				describe("and no activity exists for the given activity id", () => {
					it("throws an error", async () => {
						activityByIdSelectorStub.mock.mockImplementation(() => () => undefined);

						const dataEditors = setupDataEditors({
							childMatches: true,
							parentMatches: false
						});
						await executeProvideDataTest({
							activityId: "C",
							operation: "load",
							dataEditors,
							loadedModels,
							errorAssertion: error => {
								deepStrictEqual(error.message, "No activity found for id C.");
							}
						});
					});
				});

				describe("and the necessary models can not be loaded", () => {
					it("throws an errors", async () => {
						const dataEditors = setupDataEditors({
							childMatches: true,
							parentMatches: true
						});
						await executeProvideDataTest({
							operation: "load",
							dataEditors,
							loadedModels: "throw",
							errorAssertion: error => {
								deepStrictEqual(error.message, "Cannot load necessary models.");
							}
						});
					});
				});
			});

			interface ActivitySetupResult {
				readonly parent: {
					readonly activityMock: Activity;
					readonly dataHolderMock: DeepWriteable<Activity.DataHolder>;
				};
				readonly child: {
					readonly activityMock: Activity;
					readonly dataHolderMock: Activity.DataHolder;
				};
				readonly activities: ActivityMap;
			}

			function setupActivitiesAndActivityMap(): ActivitySetupResult {
				const childActivityDescriptor = { test: "Test", instance: "1" };
				const childActivityId = "childActivityId";

				const parentActivityDescriptor = { test: "Test" };
				const parentActivityId = "parentActivityId";

				const childActivityDataHolderMock = createDataHolder({
					descriptor: childActivityDescriptor
				});

				const childActivityMock = createActivity({
					id: childActivityId,
					descriptor: childActivityDescriptor,
					initiatingActivityId: parentActivityId,
					dataHolders: [childActivityDataHolderMock]
				});

				const parentActivityDataHolderMock = createDataHolder({
					descriptor: parentActivityDescriptor
				});

				const parentActivityMock = createActivity({
					id: parentActivityId,
					descriptor: parentActivityDescriptor,
					dataHolders: [parentActivityDataHolderMock]
				});

				const activities: ActivityMap = {
					[parentActivityId]: parentActivityMock,
					[childActivityId]: childActivityMock
				};

				return {
					activities,
					child: {
						dataHolderMock: childActivityDataHolderMock,
						activityMock: childActivityMock
					},
					parent: {
						dataHolderMock: parentActivityDataHolderMock,
						activityMock: parentActivityMock
					}
				};
			}

			function setupDataEditors(config: {
				childMatches: boolean;
				parentMatches: boolean;
				readData?: object;
				writeData?: object;
			}): DataEditor[] {
				const matchingDataEditor: DataEditor.Meta = {
					name: "TestDataLoader",
					childMatchConditions: config.childMatches
						? [
								{ key: "test", mustEqual: "Test" },
								{ key: "instance", isSet: true }
							]
						: [{ key: "test", mustEqual: "NotMatching" }],
					parentMatchConditions: config.parentMatches
						? [
								{ key: "test", mustEqual: "Test" },
								{ key: "instance", isSet: false }
							]
						: [{ key: "test", mustEqual: "NotMatching" }]
				};

				const otherDataEditor: DataEditor.Meta = {
					name: "Loader",
					childMatchConditions: [{ key: "feature", mustEqual: "Test" }],
					parentMatchConditions: [{ key: "feature", mustEqual: "Test" }]
				};

				const matchingDataEditorMock: DataEditor = {
					meta: matchingDataEditor,
					read: () => config.readData ?? {},
					write: () => config.writeData ?? {}
				};

				const notMatchingDataEditorMock: DataEditor = {
					meta: otherDataEditor,
					read: () => {
						return {};
					},
					write: () => {
						return {};
					}
				};

				return [matchingDataEditorMock, notMatchingDataEditorMock];
			}

			function createDeleteConfig(activityId?: string): DataProvider.DeleteConfig {
				return {
					activityId: activityId || "childActivityId",
					dataHolders: [],
					details: {
						instanceId: "document-1"
					},
					operation: "delete"
				};
			}

			function createSaveConfig(
				activityId?: string,
				updateActivityData?: boolean
			): DataProvider.SaveConfig {
				return {
					activityId: activityId || "childActivityId",
					dataHolders: [],
					details: {
						saving: {
							done: (result: object) => ({ type: "SavingDone", payload: result }),
							failed: () => ({ type: "SavingFailed", payload: {} })
						},
						updateActivityData: updateActivityData === true
					},
					operation: "save"
				};
			}

			function createLoadConfig(activityId?: string): DataProvider.LoadConfig {
				return {
					activityId: activityId || "childActivityId",
					dataHolders: [],
					details: {},
					operation: "load"
				};
			}

			async function executeProvideDataTest(options: {
				activityId?: string;
				operation: "load" | "delete" | "save";
				parentActivityLoadingState?: "loading" | "loaded";
				updateActivityData?: boolean;
				dataEditors: DataEditor[];
				loadedModels: ModelAPI[] | "throw";
				assertion?(putEffects: PutEffect[]): void;
				errorAssertion?(error: Error): void;
			}): Promise<void> {
				const {
					activityId,
					operation,
					updateActivityData,
					dataEditors,
					assertion,
					errorAssertion,
					parentActivityLoadingState
				} = options;

				activitySetupResult.parent.dataHolderMock.loadingState =
					parentActivityLoadingState ?? "loaded";

				const dataProvider = createDataProviderForDataEditors(dataEditors);
				const config =
					operation === "load"
						? createLoadConfig(activityId)
						: options.operation === "save"
							? createSaveConfig(activityId, updateActivityData)
							: createDeleteConfig(activityId);

				// Dummy action to trigger waitForStateChange
				const action = ModelActions.setModels({});

				let expectedErrorWasNotThrown = false;

				try {
					const { effects } = await expectSaga(dataProvider.provideData, config)
						.provide([
							[
								call.fn(ModelSagas.waitForModelsLoaded),
								options.loadedModels === "throw"
									? throwError(new Error("Cannot load necessary models."))
									: options.loadedModels
							]
						])
						.dispatch(action)
						.silentRun();

					assertion?.(effects.put);

					if (errorAssertion) {
						expectedErrorWasNotThrown = true;
					}
				} catch (error) {
					if (errorAssertion) {
						errorAssertion(error as Error);
					} else {
						throw error;
					}
				}
				if (expectedErrorWasNotThrown) {
					fail("Expected error was not thrown!");
				}
			}

			function isSetDataAction(
				action: AnyAction
			): action is Action<ActivityActions.SetDataPayload> {
				return action.type === ActivityActions.setData.type;
			}

			function findSetDataAction(
				putEffects: PutEffect[],
				activityId: string
			): Action<ActivityActions.SetDataPayload> | undefined {
				const actions = putEffects.map(e => e.payload.action);
				const setDataActions = actions.filter(isSetDataAction);
				const action = setDataActions.find(a => a.payload.activityId === activityId);

				return action;
			}

			function assertSetDataActionPayload(
				putEffects: PutEffect[],
				activityId: string,
				payload: unknown
			) {
				const action = findSetDataAction(putEffects, activityId);
				notStrictEqual(
					action,
					undefined,
					`Expected action of type ActivityActions.setData with activity id '${activityId}' to be dispatched`
				);
				deepStrictEqual(action?.payload, payload);
			}

			function assertSavingDonePayload(putEffects: PutEffect[], payload: unknown) {
				const savingDoneAction = putEffects.find(e => e.payload.action.type === "SavingDone")
					?.payload.action;
				deepStrictEqual(savingDoneAction?.payload, payload);
			}
		});
	});
});
