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
import type { CallEffect, PutEffect } from "redux-saga/effects";
import type { Action, AnyAction } from "typescript-fsa";

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/index.js";

import type { Activity, ActivityMap } from "../../../../../../core/activity/index.js";
import { ActivityActions, ActivitySelectors } from "../../../../../../core/activity/index.js";
import { createDataProviderForDataLoader } from "../../../../../../core/application/internal/adapter/createDataProviderForDataLoader.js";
import type { DataProvider } from "../../../../../../core/data/index.js";
import { DataLoader } from "../../../../../../core/data/index.js";
import { ModelActions } from "../../../../../../core/model/index.js";
import { ModelSelectors } from "../../../../../../core/model/internal/selectors.js";
import type { DeepWriteable } from "../../../../../../core/utils.js";
import { ViewSelectors } from "../../../../../../core/view/index.js";
import { createActivity, createDataHolder } from "../../../../../utils/activity.js";

describe("core.application", () => {
	describe("adapter.createDataProviderForDataLoader", () => {
		describe("given a dataLoader which should be adapted, createDataProviderForDataLoader returns a data provider with", () => {
			describe("a canHandle function, which", () => {
				const descriptor = { test: "test" };
				const activityId = "A";

				const activityMock = createActivity({ id: activityId, descriptor });

				const activities: ActivityMap = { [activityId]: activityMock };

				const adapter = createDataProviderForDataLoader;

				const meta: DataLoader.Meta = {
					name: "TestDataLoader",
					matchConditions: [
						{
							key: "test",
							mustEqual: "test"
						}
					]
				};

				const dataHolderMock = createDataHolder({ descriptor });

				describe("given the id of an activity and a data holder, that has the same descriptor as the activity", () => {
					describe("and given the adapted data loader can handle the data holder", () => {
						it("returns true for all operations", () => {
							const dataLoaderMock = createMockDataLoader({
								canHandle() {
									return DataLoader.canHandle(meta, descriptor);
								}
							});

							const { canHandle } = adapter(dataLoaderMock);

							strictEqual(
								canHandle({
									activityId,
									activities,
									dataHolder: dataHolderMock,
									operation: "load"
								}),
								true
							);

							strictEqual(
								canHandle({
									activityId,
									activities,
									dataHolder: dataHolderMock,
									operation: "save"
								}),
								true
							);

							strictEqual(
								canHandle({
									activityId,
									activities,
									dataHolder: dataHolderMock,
									operation: "delete"
								}),
								true
							);
						});
					});

					describe("given the adapted data loader can't handle the data holder", () => {
						it("returns false for all operations", () => {
							const otherMeta: DataLoader.Meta = {
								name: "TestDataLoader2",
								matchConditions: [
									{
										key: "test",
										mustEqual: "otherTest"
									}
								]
							};
							const dataLoaderMock = createMockDataLoader({
								canHandle() {
									return DataLoader.canHandle(otherMeta, descriptor);
								}
							});

							const { canHandle } = adapter(dataLoaderMock);

							strictEqual(
								canHandle({
									activityId,
									activities,
									dataHolder: dataHolderMock,
									operation: "load"
								}),
								false
							);

							strictEqual(
								canHandle({
									activityId,
									activities,
									dataHolder: dataHolderMock,
									operation: "save"
								}),
								false
							);

							strictEqual(
								canHandle({
									activityId,
									activities,
									dataHolder: dataHolderMock,
									operation: "delete"
								}),
								false
							);
						});
					});
				});

				describe("given the id of an activity and a data holder, that has a different descriptor than the activity", () => {
					it("returns false for all operations", () => {
						const dhMock: Activity.DataHolder = {
							...dataHolderMock,
							descriptor: { test: "something" }
						};

						const dataLoaderMock = createMockDataLoader({
							canHandle() {
								return DataLoader.canHandle(meta, descriptor);
							}
						});

						const { canHandle } = adapter(dataLoaderMock);

						strictEqual(
							canHandle({
								activityId,
								activities,
								dataHolder: dhMock,
								operation: "load"
							}),
							false
						);

						strictEqual(
							canHandle({
								activityId,
								activities,
								dataHolder: dhMock,
								operation: "save"
							}),
							false
						);

						strictEqual(
							canHandle({
								activityId,
								activities,
								dataHolder: dhMock,
								operation: "delete"
							}),
							false
						);
					});
				});
			});

			describe("a provideData function, which", () => {
				let activityByIdSelectorStub: Mock<typeof ActivitySelectors.activityById>;
				let activitiesSelectorStub: Mock<typeof ActivitySelectors.activities>;
				let modelDescriptorByActivityIdSelectorStub: Mock<
					typeof ModelSelectors.modelDescriptorsByActivityId
				>;
				let modelsLoadedStub: Mock<typeof ModelSelectors.modelsLoaded>;
				let activitySetupResult: ActivitySetupResult;
				let childActivityByInstanceIdSelectorStub: Mock<
					typeof ActivitySelectors.childActivityByInstanceId
				>;

				beforeEach(() => {
					mock.method(console, "error", () => undefined);
					activitySetupResult = setupActivitiesAndActivityMap();

					activityByIdSelectorStub = mock.method(
						ActivitySelectors,
						"activityById",
						() => () => activitySetupResult.activity.activityMock as Activity
					);

					activitiesSelectorStub = mock.method(
						ActivitySelectors,
						"activities",
						() => () => activitySetupResult.activities
					);

					childActivityByInstanceIdSelectorStub = mock.method(
						ActivitySelectors,
						"childActivityByInstanceId",
						() => () => undefined
					);

					mock.method(ViewSelectors, "sceneReferenceByActivityId", () => ({
						flowName: "DummyFlow",
						moduleName: "DummyModule",
						sceneName: "DummyScene"
					}));

					modelDescriptorByActivityIdSelectorStub = mock.method(
						ModelSelectors,
						"modelDescriptorsByActivityId",
						() => () => [{ modelType: "DummyModel", name: "DummyModel" }]
					);

					modelsLoadedStub = mock.method(ModelSelectors, "modelsLoaded", () => () => ({
						stateChanged: true,
						returnValue: [{ header: { id: "ModelId" } } as ModelAPI]
					}));
				});

				describe("given a config with an activity id", () => {
					describe("and a load operation", () => {
						const expectedDocumentModel = createTestDocumentModel();
						const expectedModels = [createTestFormModel(), expectedDocumentModel];

						beforeEach(() => {
							modelDescriptorByActivityIdSelectorStub.mock.mockImplementation(() => () => [
								{ name: "testFormModel", modelType: "form" }
							]);

							modelsLoadedStub.mock.mockImplementation(() => () => ({
								returnValue: expectedModels,
								stateChanged: true
							}));
						});

						it(
							"calls the load function of the data loader with the models promise " +
								"and dispatches an action to set the loaded data for the given activity",
							async () => {
								const dataToRead = { document: "Test" };
								const loadStub = mock.fn<
									(a: Activity, p: Promise<DataLoader.Models>) => Promise<object>
								>(() => Promise.resolve(dataToRead));
								const dataLoader = setupDataLoader({
									loadStub
								});
								await executeProvideDataTest({
									operation: "load",
									dataLoader,
									assertion: (putEffect: PutEffect[]) => {
										const setDataAction = findSetDataAction(putEffect, "activityId");
										deepStrictEqual(putEffect.length, 1);
										deepStrictEqual(setDataAction.payload, {
											activityId: "activityId",
											data: dataToRead
										});
									}
								});
								strictEqual(loadStub.mock.callCount(), 1);
								deepStrictEqual(await loadStub.mock.calls[0].arguments[1], {
									documentModel: expectedDocumentModel,
									modelsInScene: expectedModels
								});
							}
						);
					});

					describe("and a save operation", () => {
						describe("and no dependent activities are opened", () => {
							describe("and the data of the activity is not empty", () => {
								describe("and a data source activity is given", () => {
									before(() => {
										activitySetupResult.activity.dataHolderMock.datasourceActivityId =
											"datasourceActivityId";
									});

									it("calls the save method of the data loader and dispatches an action to set the updated data for the data source activity", async () => {
										const dataToWrite = { document: "Test" };
										const dataLoader = setupDataLoader({
											writeData: dataToWrite
										});

										await executeProvideDataTest({
											operation: "save",
											dataLoader,
											assertion: (putEffect: PutEffect[]) => {
												const setDataAction = findSetDataAction(putEffect, "datasourceActivityId");
												deepStrictEqual(putEffect.length, 2);
												deepStrictEqual(setDataAction.payload, {
													activityId: "datasourceActivityId",
													data: dataToWrite
												});
											}
										});
									});

									it("triggers a reload in the end for the data source activity id", async () => {
										const dataToWrite = { document: "Test" };
										const dataLoader = setupDataLoader({
											writeData: dataToWrite
										});
										await executeProvideDataTest({
											operation: "save",
											updateActivityData: true,
											dataLoader,
											assertion: (putEffect: PutEffect[], callEffect: CallEffect[]) => {
												const triggerReloadCall = callEffect.find(
													c => c.payload.fn.name === "triggerReload"
												);
												notStrictEqual(triggerReloadCall, undefined);
												deepStrictEqual(triggerReloadCall?.payload.args[0], "datasourceActivityId");
											}
										});
									});
								});

								describe("and no data source activity is given", () => {
									before(() => {
										activitySetupResult.activity.dataHolderMock.datasourceActivityId = undefined;
									});
									it("triggers a reload in the end for the initiating activity id", async () => {
										const dataToWrite = { document: "Test" };
										const dataLoader = setupDataLoader({
											writeData: dataToWrite
										});
										activitySetupResult.activity.activityMock.initiatingActivityId =
											"initiatingActivityId";

										await executeProvideDataTest({
											operation: "save",
											updateActivityData: true,
											dataLoader,
											assertion: (putEffect: PutEffect[], callEffect: CallEffect[]) => {
												const triggerReloadCall = callEffect.find(
													c => c.payload.fn.name === "triggerReload"
												);
												notStrictEqual(triggerReloadCall, undefined);
												deepStrictEqual(triggerReloadCall?.payload.args[0], "initiatingActivityId");
											}
										});
									});
								});

								describe("and updateDateActivityData is true", () => {
									it("calls the save method of the data loader and dispatches an action to set the updated data for the given activity", async () => {
										const dataToWrite = { document: "Test" };
										const dataLoader = setupDataLoader({
											writeData: dataToWrite
										});
										await executeProvideDataTest({
											operation: "save",
											updateActivityData: true,
											dataLoader,
											assertion: (putEffect: PutEffect[]) => {
												const setDataAction = findSetDataAction(putEffect, "activityId");
												deepStrictEqual(putEffect.length, 3);
												deepStrictEqual(setDataAction.payload, {
													activityId: "activityId",
													data: dataToWrite
												});
											}
										});
									});
								});

								describe("and the document is a SingleDocumentData", () => {
									it("calls the saving.done  method of config with the id of the document in the data", async () => {
										const dataToWrite = {
											document: { modelId: "Test", id: "document-1" }
										};
										const dataLoader = setupDataLoader({
											writeData: dataToWrite
										});
										await executeProvideDataTest({
											operation: "save",
											updateActivityData: true,
											dataLoader,
											assertion: (putEffect: PutEffect[]) => {
												const savingDoneAction = putEffect.find(
													e => e.payload.action.type === "SavingDone"
												)?.payload.action;
												deepStrictEqual(savingDoneAction?.payload, {
													instance: "document-1"
												});
											}
										});
									});
								});

								describe("and the document is not a SingleDocumentData", () => {
									it("calls the saving.done  method of config with no instance", async () => {
										const dataToWrite = { document: {} };
										const dataLoader = setupDataLoader({
											writeData: dataToWrite
										});
										await executeProvideDataTest({
											operation: "save",
											updateActivityData: true,
											dataLoader,
											assertion: (putEffect: PutEffect[]) => {
												const savingDoneAction = putEffect.find(
													e => e.payload.action.type === "SavingDone"
												)?.payload.action;
												deepStrictEqual(savingDoneAction?.payload, {
													instance: undefined
												});
											}
										});
									});
								});
							});

							describe("and the data of the activity is empty", () => {
								before(() => {
									activitySetupResult.activity.dataHolderMock.data = undefined;
								});

								after(() => {
									activitySetupResult.activity.dataHolderMock.data = {};
								});
								it("throws an error", async () => {
									const dataToWrite = { document: {} };
									const dataLoader = setupDataLoader({ writeData: dataToWrite });

									await executeProvideDataTest({
										operation: "save",
										updateActivityData: true,
										dataLoader,
										errorAssertion: error => {
											deepStrictEqual(error.message, "Cannot handle empty data");
										}
									});
								});
							});
						});

						describe("and child activities are opened", () => {
							it("calls the saving.failed method from the data loader", async () => {
								const activityMock = createActivity({
									id: "childActivity",
									initiatingActivityId: activitySetupResult.activity.activityMock.id
								});

								activitiesSelectorStub.mock.mockImplementation(() => () => ({
									...activitySetupResult.activities,
									childActivity: activityMock
								}));

								const dataToWrite = { document: {} };
								const dataLoader = setupDataLoader({ writeData: dataToWrite });

								await executeProvideDataTest({
									operation: "save",
									updateActivityData: true,
									dataLoader,
									assertion: (putEffect: PutEffect[]) => {
										const savingFailedAction = putEffect.find(
											e => e.payload.action.type === "SavingFailed"
										)?.payload.action;
										deepStrictEqual(
											(savingFailedAction as any).payload.error,
											"Dependent activities are still opened! Close or commit them before you save or commit this activity!"
										);
									}
								});
							});
						});
					});

					describe("and a delete operation", () => {
						describe("and a child activity is still opened", () => {
							describe("and the cancel request was declined", () => {
								it("does nothing more", async () => {
									const deleteSpy = mock.fn();
									const dataLoader = setupDataLoader({ deleteSpy });
									const childActivity = createActivity({ id: "childActivity" });

									childActivityByInstanceIdSelectorStub.mock.mockImplementationOnce(
										() => () => childActivity
									);
									const additionalAction = ActivityActions.responseCancelRequested({
										cancelled: false
									});

									await executeProvideDataTest({
										operation: "delete",
										dataLoader,
										additionalAction,
										assertion: (putEffect: PutEffect[], callEffect: CallEffect[]) => {
											deepStrictEqual(deleteSpy.mock.callCount(), 0);

											const triggerReloadCall = callEffect.find(
												c => c.payload.fn.name === "reloadOverview"
											);
											deepStrictEqual(triggerReloadCall, undefined);
										}
									});
								});
							});

							describe("and the cancel request was not declined", () => {
								it("calls the delete function of the data loader and triggers the reload of the activity", async () => {
									const deleteSpy = mock.fn();
									const dataLoader = setupDataLoader({ deleteSpy });
									const childActivity = createActivity({ id: "childActivity" });
									childActivityByInstanceIdSelectorStub.mock.mockImplementationOnce(
										() => () => childActivity
									);
									const additionalAction = ActivityActions.responseCancelRequested({
										cancelled: true
									});

									await executeProvideDataTest({
										operation: "delete",
										dataLoader,
										additionalAction,
										assertion: (putEffect: PutEffect[], callEffect: CallEffect[]) => {
											deepStrictEqual(deleteSpy.mock.callCount(), 1);

											const triggerReloadCall = callEffect.find(
												c => c.payload.fn.name === "reloadOverview"
											);
											notStrictEqual(triggerReloadCall, undefined);
											deepStrictEqual(triggerReloadCall?.payload.args[0], "activityId");
										}
									});
								});
							});
						});

						describe("and no child activity is still opened", () => {
							it("calls the delete function of the data loader and triggers the reload of the activity", async () => {
								const deleteSpy = mock.fn();
								const dataLoader = setupDataLoader({ deleteSpy });

								childActivityByInstanceIdSelectorStub.mock.mockImplementationOnce(
									() => () => undefined
								);
								await executeProvideDataTest({
									operation: "delete",
									dataLoader,

									assertion: (putEffect: PutEffect[], callEffect: CallEffect[]) => {
										deepStrictEqual(deleteSpy.mock.callCount(), 1);

										const triggerReloadCall = callEffect.find(
											c => c.payload.fn.name === "reloadOverview"
										);
										notStrictEqual(triggerReloadCall, undefined);
										deepStrictEqual(triggerReloadCall?.payload.args[0], "activityId");
									}
								});
							});
						});
					});

					describe("and no activity exists for the given activity id", () => {
						it("throws an error", async () => {
							activityByIdSelectorStub.mock.mockImplementationOnce(() => () => undefined);

							const dataLoader = setupDataLoader({});
							await executeProvideDataTest({
								activityId: "C",
								operation: "load",
								dataLoader,
								errorAssertion: (error: any) => {
									deepStrictEqual(error.message, "No activity found for id C.");
								}
							});
						});
					});

					describe("and no default data holder exists for the given activity", () => {
						it("throws an error", async () => {
							const dataLoader = setupDataLoader({});
							await executeProvideDataTest({
								operation: "load",
								dataLoader,
								emptyActivityDataHolders: true,
								errorAssertion: (error: any) => {
									strictEqual(
										error.message,
										"No default DataHolder found for activityId activityId"
									);
								}
							});
						});
					});

					describe("and the necessary models can not be loaded", () => {
						it("throws an errors", async () => {
							modelsLoadedStub.mock.mockImplementationOnce(() => () => ({
								returnValue: undefined,
								stateChanged: true
							}));

							const dataLoader = setupDataLoader({});
							await executeProvideDataTest({
								operation: "load",
								dataLoader,
								errorAssertion: (error: any) => {
									strictEqual(error.message, "Cannot load necessary models.");
								}
							});
						});
					});
				});

				interface ActivitySetupResult {
					readonly activity: {
						readonly activityMock: DeepWriteable<Activity>;
						readonly dataHolderMock: DeepWriteable<Activity.DataHolder>;
					};
					readonly dataSourceActivity: {
						readonly activityMock: Activity;
						readonly dataHolderMock: Activity.DataHolder;
					};
					readonly activities: ActivityMap;
				}

				function setupActivitiesAndActivityMap(): ActivitySetupResult {
					const activityDescriptor = {
						test: "Test",
						instance: "1",
						model: "ModelId"
					};
					const activityId = "activityId";
					const activityDataHolderMock = createDataHolder({ descriptor: activityDescriptor });

					const activityMock = createActivity({
						id: activityId,
						descriptor: activityDescriptor,
						dataHolders: [activityDataHolderMock]
					});

					const dataSourceActivityDataHolderMock = createDataHolder({
						descriptor: activityDescriptor
					});

					const dataSourceActivityMock = createActivity({ id: "datasourceActivityId" });

					const activities: ActivityMap = {
						[activityId]: activityMock
					};

					return {
						activities,
						activity: {
							dataHolderMock: activityDataHolderMock,
							activityMock: activityMock
						},
						dataSourceActivity: {
							dataHolderMock: dataSourceActivityDataHolderMock,
							activityMock: dataSourceActivityMock
						}
					};
				}

				function setupDataLoader(config: {
					writeData?: object;
					deleteSpy?: Mock<() => void>;
					useActivityDescriptorModel?: boolean;
					loadStub?: Mock<(a: Activity, p: Promise<DataLoader.Models>) => Promise<object>>;
				}): DataLoader {
					return createMockDataLoader({
						useActivityDescriptorModel: config.useActivityDescriptorModel ? () => true : undefined,
						load: config.loadStub,
						save: config.writeData
							? () => {
									return Promise.resolve(config.writeData!);
								}
							: undefined,
						delete: config.deleteSpy ? deleteFunction : undefined
					});

					async function deleteFunction(): Promise<void> {
						await config.deleteSpy!();
					}
				}

				function createDeleteConfig(
					activityId?: string,
					dataHolders?: Activity.DataHolder<{}>[]
				): DataProvider.DeleteConfig {
					return {
						activityId: activityId || "activityId",
						dataHolders: dataHolders || [],
						details: {
							instanceId: "document-1"
						},
						operation: "delete"
					};
				}

				function createSaveConfig(
					activityId?: string,
					updateActivityData?: boolean,
					dataHolders?: Activity.DataHolder<{}>[]
				): DataProvider.SaveConfig {
					return {
						activityId: activityId || "activityId",
						dataHolders: dataHolders || [],
						details: {
							saving: {
								done: (result: object) => ({
									type: "SavingDone",
									payload: result
								}),
								failed: (result: object) => ({
									type: "SavingFailed",
									payload: result
								})
							},
							updateActivityData: updateActivityData === true
						},
						operation: "save"
					};
				}

				function createLoadConfig(
					activityId?: string,
					dataHolders?: Activity.DataHolder<{}>[]
				): DataProvider.LoadConfig {
					return {
						activityId: activityId || "activityId",
						dataHolders: dataHolders || [],
						details: {},
						operation: "load"
					};
				}

				function createTestFormModel(): ModelAPI {
					return {
						header: {
							id: "testFormModel",
							modelType: "form",
							modelVersion: "testVersion",
							modelReferences: [{ reference: "testDocumentModel", modelType: "document" }]
						}
					} as unknown as ModelAPI;
				}

				function createTestDocumentModel(): DocumentModel {
					return {
						header: {
							id: "testDocumentModel",
							modelType: "document",
							modelVersion: "testVersion"
						}
					} as unknown as DocumentModel;
				}

				async function executeProvideDataTest(options: {
					activityId?: string;
					operation: "load" | "delete" | "save";
					updateActivityData?: boolean;
					dataLoader: DataLoader;
					additionalAction?: Action<any>;
					emptyActivityDataHolders?: boolean;
					assertion?(putEffect: PutEffect[], callEffect: CallEffect[]): void;
					errorAssertion?(error: any): void;
				}): Promise<void> {
					const {
						activityId,
						operation,
						updateActivityData,
						dataLoader,
						assertion,
						errorAssertion,
						additionalAction,
						emptyActivityDataHolders
					} = options;

					const activity = activitySetupResult.activity.activityMock;
					const dataProvider = createDataProviderForDataLoader(dataLoader);
					const dataHolders = emptyActivityDataHolders
						? []
						: (activity.dataHolders as Activity.DataHolder[]);
					const config =
						operation === "load"
							? createLoadConfig(activityId, dataHolders)
							: options.operation === "save"
								? createSaveConfig(activityId, updateActivityData, dataHolders)
								: createDeleteConfig(activityId, dataHolders);

					// Dummy action to trigger waitForStateChange
					const action = ModelActions.setModels({});

					if (errorAssertion) {
						await expectSaga(dataProvider.provideData, config)
							/*
								.provide([
									[call.fn(ModelSagas.waitForModelsLoaded), [Mock.ofType<ModelAPI>()]],
									[call.fn(ModelSagas.waitForModelsLoaded), [Mock.ofType<ModelAPI>()]],
									[call.fn(ModelSagas.waitForModelsLoaded), [Mock.ofType<ModelAPI>()]]
								]) */
							.dispatch(action)
							.silentRun()
							.catch(error => {
								errorAssertion(error);
							});
					} else if (assertion) {
						const saga = expectSaga(dataProvider.provideData, config).dispatch(action);

						if (additionalAction) {
							saga.dispatch(additionalAction);
						}

						saga.silentRun().then(result => {
							assertion(result.effects.put, result.effects.call);
						});
					}
				}

				function isSetDataAction(
					action: AnyAction
				): action is Action<ActivityActions.SetDataPayload> {
					return action.type === ActivityActions.setData.type;
				}

				function findSetDataAction(
					putEffect: PutEffect[],
					activityId: string
				): Action<ActivityActions.SetDataPayload> {
					const actions = putEffect.map(e => e.payload.action);
					const setDataActions = actions.filter(isSetDataAction);
					const action = setDataActions.find(
						a => isSetDataAction(a) && a.payload.activityId === activityId
					);

					if (action === undefined) {
						fail("No ActivityActions.setData with activity id 'B' was dispatched");
					}

					return action;
				}
			});
		});
	});
});

function createMockDataLoader(partial?: Partial<DataLoader>): DataLoader {
	return {
		name: "mock",
		canHandle: () => true,
		load: async () => {
			return {};
		},
		save: async () => {
			return {};
		},
		delete: async () => {},
		...partial
	};
}
