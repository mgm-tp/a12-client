// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual, doesNotThrow, notStrictEqual, strictEqual } from "node:assert/strict";
import { mock } from "node:test";

import type { StoreEnhancer } from "redux";
import { compose } from "redux";
import createSagaMiddleware, { type SagaMiddlewareOptions } from "redux-saga";
import type { SagaGenerator } from "typed-redux-saga";
import { call, takeEvery } from "typed-redux-saga";
import { isType } from "typescript-fsa";

import { Locale } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";
import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging/index.js";

import { ActivityActions, ActivitySelectors } from "../../../../core/activity/index.js";
import type {
	ApplicationSaga,
	ApplicationSetup,
	ComposeEnhancer
} from "../../../../core/application/index.js";
import {
	ApplicationActions,
	ApplicationFactories,
	ApplicationSelectors
} from "../../../../core/application/index.js";
import CancelActivities from "../../../../core/application/internal/sagas/cancelActivities.js";
import { DataSagas } from "../../../../core/application/internal/sagas/data/index.js";
import ErrorHandling from "../../../../core/application/internal/sagas/errorHandling.js";
import MainMenuSagas from "../../../../core/application/internal/sagas/main-menu.js";
import { LocaleActions, LocaleSelectors } from "../../../../core/locale/index.js";
import type { ApplicationModel } from "../../../../core/model/index.js";
import { ModelSelectors } from "../../../../core/model/index.js";
import { InternalModelSagaFactory } from "../../../../core/model/internal/ModelLoader.js";
import { StoreActions, StoreFactories } from "../../../../core/store/index.js";
import { createSliceSelector } from "../../../../core/store/internal/selectors.js";
import { isRecord } from "../../../../core/utils.js";
import {
	anotherDummyAction,
	dummyAction,
	mockAction
} from "../../../mocks/application/actionMocks.js";
import { mockDataEditor } from "../../../mocks/application/dataEditorMock.js";
import { mockModelLoader } from "../../../mocks/application/modelLoaderMock.js";
import { cancelSagaMock } from "../../../mocks/application/platformSagaMock.js";
import { sagaMock } from "../../../mocks/application/sagaMock.js";
import { DE_LOCALE, US_LOCALE } from "../../../utils/localization.js";
import type { ClientState } from "../../../utils/test-utils.js";

const logger = LoggerFactory.getLogger("core/store");

export type ViewKey = string | number | null;

interface TestSlice {
	test: string;
}

namespace TestSlice {
	function isInstance(slice: unknown): slice is TestSlice {
		return isRecord(slice);
	}

	export const selector = createSliceSelector("testSlice", isInstance);
}

describe("core.application", () => {
	describe("ApplicationActions", () => {
		describe("setBusy", () => {
			it("is an action, that can be dispatched with a boolean as payload", () => {
				const expectedAction = {
					type: "Application/SET_BUSY",
					payload: false
				};

				deepStrictEqual(ApplicationActions.setBusy(false), expectedAction);
			});
		});
	});

	describe("ApplicationFactories", () => {
		describe("createApplicationSetup", () => {
			const model: ApplicationModel = {
				header: {
					id: "MOCK-MODEL",
					modelType: "application",
					modelVersion: "1.0.0"
				},
				content: {
					region: {
						name: "APP",
						layout: { name: "ApplicationFrame" },
						subRegions: [
							{ name: "CONTENT", layout: { name: "MasterDetail" } },
							{ name: "SIDEBAR", layout: { name: "Null" } },
							{ name: "MODAL", layout: { name: "Stack" } }
						]
					},
					defaultRegion: ["CONTENT"],
					modules: []
				}
			};

			const defaultSetup: ApplicationFactories.Config = {
				model,
				modelLoader: mockModelLoader,
				dataHandlers: [],
				overridePlatformSagas: undefined,
				additionalMiddlewares: [],
				customSagas: undefined,
				dispatchSaga: undefined,
				setupActions: undefined
			};

			describe("Returns a store", () => {
				let config: ApplicationSetup;
				before(() => {
					config = ApplicationFactories.createApplicationSetup(defaultSetup);
				});

				it("which contains a valid models slice with the correct model", () => {
					notStrictEqual((config.store.getState() as ClientState).models, undefined);
					doesNotThrow(() => ModelSelectors.applicationModel()(config.store.getState()));

					const actualModel = ModelSelectors.applicationModel()(config.store.getState());
					deepStrictEqual(actualModel, model);
				});

				it("which contains a valid activities slice", () => {
					notStrictEqual((config.store.getState() as ClientState).activities, undefined);
					doesNotThrow(() => ActivitySelectors.activities()(config.store.getState()));
				});

				describe("locale", () => {
					const testLocale = Locale.fromString("xx_XX") as Locale;

					it("is a valid locale slice", () => {
						notStrictEqual((config.store.getState() as ClientState).locale, undefined);
						doesNotThrow(() => LocaleSelectors.locale()(config.store.getState()));
					});

					it(`uses the provided default locale`, () => {
						const { store } = ApplicationFactories.createApplicationSetup({
							...defaultSetup,
							locale: testLocale
						});

						strictEqual(LocaleSelectors.locale()(store.getState()), testLocale);
					});

					it(`fallbacks to the default locale if the locale form the local storage is invalid`, () => {
						window.localStorage.setItem("locale", "not_a_locale");

						const locale = DE_LOCALE;
						const { store } = ApplicationFactories.createApplicationSetup({
							...defaultSetup,
							locale
						});

						strictEqual(LocaleSelectors.locale()(store.getState()), locale);
					});

					it(`fallbacks to "en_US" if no default locale is provided`, () => {
						const { store } = ApplicationFactories.createApplicationSetup({
							...defaultSetup,
							locale: undefined
						});
						deepStrictEqual(LocaleSelectors.locale()(store.getState()), US_LOCALE);
					});
				});

				it("which contains a valid application slice", () => {
					notStrictEqual((config.store.getState() as ClientState).application, undefined);
					doesNotThrow(() => ApplicationSelectors.busy()(config.store.getState()));
				});
			});

			describe("Middlewares", () => {
				it("registers a logging middleware", () => {
					const loggingStub = mock.method(logger, "trace");
					const config = ApplicationFactories.createApplicationSetup(defaultSetup);

					config.store.dispatch(dummyAction("Dummy Log"));
					strictEqual(loggingStub.mock.callCount() > 1, true);
				});

				it("registers all additional middlewares", () => {
					const dummyMiddleware = StoreFactories.createMiddleware((api, next, action) => {
						if (isType(action, dummyAction)) {
							action.payload = "dummyMiddleware: Changed payload";
							return next(action);
						}
						return next(action);
					});

					const anotherDummyMiddleware = StoreFactories.createMiddleware((api, next, action) => {
						if (isType(action, anotherDummyAction)) {
							action.payload = "anotherDummyMiddleware: Changed payload";
							return next(action);
						}
						return next(action);
					});

					const setup: ApplicationFactories.Config = {
						...defaultSetup,
						additionalMiddlewares: [dummyMiddleware, anotherDummyMiddleware]
					};

					const config = ApplicationFactories.createApplicationSetup(setup);

					const myDummyAction = config.store.dispatch(dummyAction("something"));
					const mySecondDummyAction = config.store.dispatch(anotherDummyAction("something else"));

					strictEqual(myDummyAction.payload, "dummyMiddleware: Changed payload");
					strictEqual(mySecondDummyAction.payload, "anotherDummyMiddleware: Changed payload");
				});
			});

			describe("Sagas", () => {
				describe("Dispatcher", () => {
					it("registers the built-in dispatch saga as default", async () => {
						const { resolve, promise } = Promise.withResolvers();

						const customAction = { type: "custom" };

						const customAppSaga: ApplicationSaga.Descriptor = {
							canHandle(_, action) {
								return action === customAction;
							},
							handle: function* (action) {
								yield* call(resolve, action);
							}
						};

						const { store } = ApplicationFactories.createApplicationSetup({
							...defaultSetup,
							overridePlatformSagas: [customAppSaga]
						});

						store.dispatch(customAction);

						const r = await promise;

						strictEqual(r, customAction);
					});

					it("registers a custom dispatcher when given", async () => {
						const { resolve, promise } = Promise.withResolvers();

						function* myCustomDispatchSaga(
							sagas: ApplicationSaga.Descriptor[] = []
						): SagaGenerator<void> {
							yield* takeEvery(() => true, resolve);
						}

						const setup: ApplicationFactories.Config = {
							...defaultSetup,
							dispatchSaga: myCustomDispatchSaga
						};

						const { store } = ApplicationFactories.createApplicationSetup(setup);

						store.dispatch({ type: "custom" });

						return promise;
					});
				});

				describe("Build-in platform sagas", () => {
					describe("Registration", () => {
						function executeTest(
							obj: Record<
								string,
								(config: ApplicationSaga.Configuration) => ApplicationSaga.Descriptor
							>,
							method: string
						) {
							const canHandleMock = mock.fn();

							mock.method(obj, method, () => ({
								canHandle: canHandleMock,
								handle: () => {}
							}));

							const config = ApplicationFactories.createApplicationSetup(defaultSetup);
							config.store.dispatch(dummyAction("sagas"));

							strictEqual(canHandleMock.mock.callCount(), 1);
						}

						describe("Error Handling sagas", () => {
							it("starts a log activity error saga", () => {
								executeTest(ErrorHandling, "logActivityErrorSaga");
							});
						});

						describe("Data sagas", () => {
							it("starts a push activity saga", () => {
								executeTest(DataSagas, "pushActivitySaga");
							});

							it("starts a commit done activity saga", () => {
								executeTest(DataSagas, "commitDoneActivitySaga");
							});

							it("starts a cancel activity saga", () => {
								executeTest(DataSagas, "cancelActivitySaga");
							});

							it("starts a load activity saga", () => {
								executeTest(DataSagas, "loadActivityDataSaga");
							});

							it("starts a commit start activity saga", () => {
								executeTest(DataSagas, "commitStartActivitySaga");
							});

							it("starts delete data saga", () => {
								executeTest(DataSagas, "deleteDataSaga");
							});
						});

						describe("CancelActivities", () => {
							it("starts a cancel activities saga", () => {
								executeTest(CancelActivities, "cancelActivities");
							});
						});

						describe("MainMenuSagas", () => {
							it("starts a main menu item click saga", () => {
								executeTest(MainMenuSagas, "mainMenuItemClickSaga");
							});
						});
					});

					describe("Configuration", () => {
						const expectedDataHandlers = [mockDataEditor];

						const setup: ApplicationFactories.Config = {
							...defaultSetup,
							dataHandlers: expectedDataHandlers
						};

						describe("ModelSagas", () => {
							it("gives the correct configuration to the new load models saga", () => {
								// new loader takes precedence
								const newSetup: ApplicationFactories.Config = {
									...defaultSetup,
									modelLoader: mockModelLoader,
									dataHandlers: expectedDataHandlers
								};

								const spy = mock.method(InternalModelSagaFactory, "createModelLoadingSaga");
								ApplicationFactories.createApplicationSetup(newSetup);
								strictEqual(spy.mock.callCount(), 1);
								strictEqual(spy.mock.calls[0].arguments[0], newSetup.modelLoader);
							});
						});

						describe("Data sagas", () => {
							it("gives the correct configuration to the push activity saga", () => {
								const spy = mock.method(DataSagas, "pushActivitySaga");
								ApplicationFactories.createApplicationSetup(setup);

								strictEqual(spy.mock.callCount(), 1);
							});

							it("gives the correct configuration to the commit done activity saga", () => {
								const spy = mock.method(DataSagas, "commitDoneActivitySaga");
								ApplicationFactories.createApplicationSetup(setup);

								strictEqual(spy.mock.callCount(), 1);
							});

							it("gives the correct configuration to the cancel activity saga", () => {
								const spy = mock.method(DataSagas, "cancelActivitySaga");
								ApplicationFactories.createApplicationSetup(setup);

								strictEqual(spy.mock.callCount(), 1);
							});

							it("gives the correct configuration to the load activity saga", () => {
								const spy = mock.method(DataSagas, "loadActivityDataSaga");
								ApplicationFactories.createApplicationSetup(setup);
								strictEqual(spy.mock.callCount(), 1);
							});

							it("gives the correct configuration to the commit start activity saga", () => {
								const spy = mock.method(DataSagas, "commitStartActivitySaga");
								ApplicationFactories.createApplicationSetup(setup);
								strictEqual(spy.mock.callCount(), 1);
							});

							it("gives the correct configuration to the delete data saga", () => {
								const spy = mock.method(DataSagas, "deleteDataSaga");
								ApplicationFactories.createApplicationSetup(setup);
								strictEqual(spy.mock.callCount(), 1);
							});
						});
					});
				});

				describe("Additional Platform sagas", () => {
					it("executes the handle method of a built-in saga if no additional platform saga is given for a certain action", () => {
						const config = ApplicationFactories.createApplicationSetup(defaultSetup);

						config.store.dispatch(
							ActivityActions.create({
								activityDescriptor: {
									page: "DirtyHandling"
								},
								activityId: "A"
							})
						);

						const stateBefore = config.store.getState();
						const activitiesBefore = ActivitySelectors.activities()(stateBefore);
						strictEqual(
							Object.keys(activitiesBefore).length,
							1,
							"Expected one activity in the store"
						);

						config.store.dispatch(ActivityActions.cancelRequested({ activityIds: ["A"] }));

						const state = config.store.getState();
						const activities = ActivitySelectors.activities()(state);
						strictEqual(
							Object.keys(activities).length,
							0,
							"Expected no activities in the store after cancelRequested got dispatched"
						);
					});

					describe("Add an additional platform saga which takes care of cancelRequested action", () => {
						it("executes the handle method of the additional platform saga instead of the built-in one", () => {
							const setup: ApplicationFactories.Config = {
								...defaultSetup,
								overridePlatformSagas: [cancelSagaMock()]
							};

							const config = ApplicationFactories.createApplicationSetup(setup);

							config.store.dispatch(
								ActivityActions.create({
									activityDescriptor: {
										page: "DirtyHandling"
									},
									activityId: "A"
								})
							);

							const stateBefore = config.store.getState();
							const activitiesBefore = ActivitySelectors.activities()(stateBefore);
							strictEqual(
								Object.keys(activitiesBefore).length,
								1,
								"Expected one activity in the store"
							);

							config.store.dispatch(ActivityActions.cancelRequested({ activityIds: ["A"] }));

							const state = config.store.getState();
							const activities = ActivitySelectors.activities()(state);
							strictEqual(
								Object.keys(activities).length,
								1,
								"Expected the additional platform-saga to take care of cancelRequested"
							);

							const activity = ActivitySelectors.activityById("A")(state);

							notStrictEqual(activity, undefined);
						});
					});
				});

				describe("Build-in sagas", () => {
					describe("Model sagas", () => {
						it("starts a load models saga", () => {
							const modelLoadingSagaSpy = mock.method(
								InternalModelSagaFactory,
								"createModelLoadingSaga"
							);

							ApplicationFactories.createApplicationSetup(defaultSetup);

							strictEqual(modelLoadingSagaSpy.mock.callCount(), 1);
						});
					});
				});

				describe("Custom sagas", () => {
					it("starts the custom sagas", () => {
						const setup: ApplicationFactories.Config = {
							...defaultSetup,
							customSagas: [sagaMock]
						};

						const config = ApplicationFactories.createApplicationSetup(setup);

						config.store.dispatch(
							ActivityActions.create({
								activityDescriptor: {
									page: "DirtyHandling"
								},
								activityId: "A"
							})
						);

						const stateBefore = config.store.getState();
						const activitiesBefore = ActivitySelectors.activities()(stateBefore);
						strictEqual(
							Object.keys(activitiesBefore).length,
							1,
							"Expected one activity in the store"
						);

						config.store.dispatch(mockAction({ id: "A", model: "" }));

						const state = config.store.getState();
						const newActivity = ActivitySelectors.activityById("AA")(state);

						notStrictEqual(
							newActivity,
							undefined,
							"Expected that the registered custom saga creates a second activity"
						);
					});
				});
			});

			describe("Reducers", () => {
				it("registers the default reducers if no reducerMap is provided", () => {
					const config = ApplicationFactories.createApplicationSetup(defaultSetup);

					const expectedLocale = Locale.fromString("xx_XX") as Locale;
					config.store.dispatch(LocaleActions.set(expectedLocale));
					const locale = LocaleSelectors.locale()(config.store.getState());

					strictEqual(locale, expectedLocale, "Locale was not dispatched correctly!");
				});

				it("registers the default reducers if a reducerMap is provided", () => {
					const setup: ApplicationFactories.Config = {
						...defaultSetup,
						reducerMap: {}
					};

					const config = ApplicationFactories.createApplicationSetup(setup);

					const expectedLocale = Locale.fromString("xx_XX") as Locale;
					config.store.dispatch(LocaleActions.set(expectedLocale));
					const locale = LocaleSelectors.locale()(config.store.getState());

					strictEqual(locale, expectedLocale, "Locale was not dispatched correctly!");
				});

				it("registers the reducers of the provided reducerMap", () => {
					const setup: ApplicationFactories.Config = {
						...defaultSetup,
						reducerMap: {
							custom(state = "", action) {
								return dummyAction.match(action) ? action.payload : state;
							}
						}
					};

					const config = ApplicationFactories.createApplicationSetup(setup);

					config.store.dispatch(dummyAction("test"));

					const { custom } = config.store.getState() as any;

					notStrictEqual(custom, undefined, "Expected custom not to be undefined");
					strictEqual(custom, "test", "Wrong text");
				});
			});

			describe("Setup actions", () => {
				describe("given a set of setup actions", () => {
					it("executes the actions", () => {
						const action1Spy = mock.method(ActivityActions, "create");
						const action2Spy = mock.method(ActivityActions, "setDirty");

						const action1 = ActivityActions.create({
							activityId: "A",
							activityDescriptor: { model: "CRUD" }
						});
						const action2 = ActivityActions.setDirty({
							activityId: "A",
							dirty: true
						});

						const newSetup: ApplicationFactories.Config = {
							...defaultSetup,
							setupActions: [action1, action2]
						};

						ApplicationFactories.createApplicationSetup(newSetup);

						strictEqual(action1Spy.mock.callCount(), 1, "Expected given actions to be called");
						strictEqual(action2Spy.mock.callCount(), 1, "Expected that given action are called");
					});

					it("resets the state to the initial state when StoreActions.resetState action is dispatched", () => {
						const action1 = ActivityActions.create({
							activityId: "A",
							activityDescriptor: { model: "CRUD" }
						});
						const action2 = ActivityActions.setDirty({
							activityId: "A",
							dirty: true
						});

						const newSetup: ApplicationFactories.Config = {
							...defaultSetup,
							setupActions: [action1, action2]
						};

						const config = ApplicationFactories.createApplicationSetup(newSetup);

						const stateBefore = config.store.getState();
						const activityBefore = ActivitySelectors.activityById("A")(stateBefore);
						notStrictEqual(
							activityBefore,
							undefined,
							"Expected an activity with id A in the store"
						);

						config.store.dispatch(ActivityActions.cancel({ activityId: "A" }));

						const stateAfterCancel = config.store.getState();
						const activityAfterCancel = ActivitySelectors.activityById("A")(stateAfterCancel);
						strictEqual(
							activityAfterCancel,
							undefined,
							"Expected to not find an activity with id A in the store"
						);

						config.store.dispatch(StoreActions.resetState());

						const stateAfter = config.store.getState();
						const activityAfter = ActivitySelectors.activityById("A")(stateAfter);
						notStrictEqual(
							activityAfter,
							undefined,
							"Expected an activity with id A in the store after reset was dispatched"
						);
					});
				});
			});

			describe("Store Enhancer", () => {
				describe("given a store enhancer passed as parameter", () => {
					const storeEnhancer: StoreEnhancer = function mockEnhancer(createStore) {
						return reducer => {
							const testSlice: TestSlice = { test: "Test" };
							// FIXME: Try to find the correct typing

							return createStore(reducer, { testSlice } as any);
						};
					};

					const composeEnhancer: ComposeEnhancer = function mockEnhancer(
						...enhancers
					): StoreEnhancer {
						return compose(storeEnhancer, ...enhancers);
					};

					it("returns a store enhanced by the enhancer", () => {
						const newSetup: ApplicationFactories.Config = {
							...defaultSetup,
							composeEnhancer
						};
						const setupResult = ApplicationFactories.createApplicationSetup(newSetup);
						const sliceValue = TestSlice.selector(setupResult.store.getState());
						strictEqual(sliceValue.test, "Test");
					});
				});
			});

			describe("Saga Middleware", () => {
				it("should use the given customSagaMiddleware instead the default one", () => {
					const testOnErrorHandler = mock.fn();
					const testSagaMiddlewareOptions: SagaMiddlewareOptions = {
						onError: testOnErrorHandler
					};
					function* testHelperSaga(): SagaGenerator<void> {
						yield* takeEvery("*", () => {
							throw new Error("test error");
						});
					}

					const customSagaMiddleware = createSagaMiddleware(testSagaMiddlewareOptions);

					const testConfig: ApplicationFactories.Config = {
						...defaultSetup,
						customSagas: [testHelperSaga],
						customSagaMiddleware
					};
					const testApplicationSetup = ApplicationFactories.createApplicationSetup(testConfig);

					testApplicationSetup.store.dispatch(dummyAction("test"));

					strictEqual(testOnErrorHandler.mock.callCount() > 0, true);
				});

				it("should use the default sagaMiddleware if customSagaMiddleware is not given", () => {
					const sagaExecutionSpy = mock.fn();

					function* testHelperSaga(): SagaGenerator<void> {
						yield* takeEvery("*", function* handler(): SagaGenerator<void> {
							yield* call(sagaExecutionSpy);
						});
					}

					const testConfig: ApplicationFactories.Config = {
						...defaultSetup,
						customSagas: [testHelperSaga]
					};
					const testApplicationSetup = ApplicationFactories.createApplicationSetup(testConfig);

					testApplicationSetup.store.dispatch(dummyAction("test"));

					strictEqual(sagaExecutionSpy.mock.callCount() > 0, true);
				});
			});
		});
	});
});
