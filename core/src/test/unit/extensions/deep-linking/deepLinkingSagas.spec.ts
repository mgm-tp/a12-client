// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual, strictEqual } from "node:assert/strict";
import { mock } from "node:test";

import type { RunSagaOptions, Saga } from "redux-saga";
import { runSaga } from "redux-saga";
import { expectSaga } from "redux-saga-test-plan";
import { takeEvery } from "redux-saga/effects";
import type { Action } from "typescript-fsa";
import { actionCreatorFactory } from "typescript-fsa";

import { LogLevel, MinLogLevelLoggingStrategy, Settings } from "@com.mgmtp.a12.utils/utils-logging";

import type { Activity } from "../../../../core/activity/index.js";
import { ActivityActions } from "../../../../core/activity/index.js";
import type { ApplicationModel } from "../../../../core/model/index.js";
import { ActivityDescriptorBasedDeepLinkCoder } from "../../../../extensions/deep-linking/internal/deepLinkCoder.js";
import type { Configuration } from "../../../../extensions/deep-linking/internal/deepLinkingSagas.js";
import {
	applyDeepLink,
	browserLocationManager,
	clearDeepLink,
	handleApplyDeepLink,
	handleLoadWelcomePage,
	handleUpdateDeepLink,
	loadWelcomePage,
	updateDeepLink
} from "../../../../extensions/deep-linking/internal/deepLinkingSagas.js";
import { createGeneralStore } from "../../../mocks/store/store.js";
import { createActivity, createDataHolder } from "../../../utils/activity.js";

const encodedDeepLink = "this/link/is/encoded";

describe("extensions.deep-linking.internal.deepLinkingSagas", () => {
	function createConfig() {
		return {
			deepLinkCoder: { encode: mock.fn(), decode: mock.fn() },
			locationManager: {
				getDeepLink: mock.fn(),
				setDeepLink: mock.fn(),
				getLocation: mock.fn()
			}
		} satisfies Configuration;
	}

	const fakeDataHolder: Activity.DataHolder = {
		descriptor: { model: "deep-linking-test" },
		data: {},
		dirty: false,
		loadingState: "missing",
		savingState: "not_saved",
		slices: {},
		datasourceActivityId: undefined
	};

	describe("handleUpdateDeepLink", () => {
		it("resets the deep link, if there is no current activity", async () => {
			// when
			const config = createConfig();
			await executeSaga(handleUpdateDeepLink, createGeneralStore().store.getState(), config);

			// then
			deepStrictEqual(config.locationManager.setDeepLink.mock.calls[0].arguments, [""]);
		});

		it("passes the encoder only the current activity, if it does not reference a source activity", async () => {
			// setup
			const config = createConfig();
			const activityId = "activity1";

			const activityMock = createActivity({
				id: activityId,
				descriptor: { model: "deep-linking-test" },
				dataHolders: [fakeDataHolder]
			});

			config.deepLinkCoder.encode.mock.mockImplementation(() => encodedDeepLink);

			// when
			await executeSaga(
				handleUpdateDeepLink,
				createGeneralStore({ activities: [activityMock] }).store.getState(),
				config
			);

			// then
			deepStrictEqual(config.locationManager.setDeepLink.mock.calls[0].arguments, [
				encodedDeepLink
			]);
		});

		it("passes the current activity and all referenced source activities to the encoder", async () => {
			// setup
			const config = createConfig();
			const activityMock1 = createActivity({
				id: "activity1",
				descriptor: fakeDataHolder.descriptor,
				activationTimestamp: 0,
				dataHolders: [fakeDataHolder]
			});

			const sourceActivityMock2 = createActivity({
				id: "activity2",
				descriptor: fakeDataHolder.descriptor,
				initiatingActivityId: activityMock1.id,
				activationTimestamp: 1,
				dataHolders: [fakeDataHolder]
			});

			const sourceActivityMock3 = createActivity({
				id: "activity3",
				descriptor: fakeDataHolder.descriptor,
				initiatingActivityId: sourceActivityMock2.id,
				activationTimestamp: 2,
				dataHolders: [
					{
						...fakeDataHolder,
						datasourceActivityId: sourceActivityMock2.id
					}
				]
			});

			const activityMock4 = createActivity({
				id: "activity4",
				descriptor: fakeDataHolder.descriptor,
				initiatingActivityId: sourceActivityMock3.id,
				activationTimestamp: 3,
				dataHolders: [
					{
						...fakeDataHolder,
						datasourceActivityId: sourceActivityMock3.id
					}
				]
			});

			config.deepLinkCoder.encode.mock.mockImplementation(() => encodedDeepLink);

			const activities = [activityMock1, sourceActivityMock2, sourceActivityMock3, activityMock4];
			// when
			await executeSaga(
				handleUpdateDeepLink,
				createGeneralStore({ activities }).store.getState(),
				config
			);

			// then
			strictEqual(config.deepLinkCoder.encode.mock.callCount(), 1);
			deepStrictEqual(config.deepLinkCoder.encode.mock.calls[0].arguments, [
				activityMock4,
				[sourceActivityMock2, sourceActivityMock3]
			]);

			strictEqual(config.locationManager.setDeepLink.mock.callCount(), 1);
			deepStrictEqual(config.locationManager.setDeepLink.mock.calls[0].arguments, [
				encodedDeepLink
			]);
		});

		describe("given a minimal Configuration with only the deepLinkCoder", () => {
			it("uses a default locationManager", async () => {
				const locationSpy = mock.method(browserLocationManager, "setDeepLink");
				const configLocal: Configuration = {
					deepLinkCoder: new ActivityDescriptorBasedDeepLinkCoder()
				};

				await executeSaga(handleUpdateDeepLink, createGeneralStore().store.getState(), configLocal);

				strictEqual(locationSpy.mock.callCount(), 1);
			});
		});
	});

	describe("handleApplyDeepLink", () => {
		it("dispatches a single action, if only one is returned by the coder", async () => {
			const config = createConfig();
			const offerModule: ApplicationModel.Module = {
				name: "Offer",
				menu: {
					name: "Offer",
					initialActivity: {
						descriptor: {
							model: "offer"
						}
					}
				},
				flows: [
					{
						name: "offer-flow",
						scenes: [
							{
								name: "offer-scene",
								matchConditions: [
									{
										key: "model",
										mustEqual: "offer"
									},
									{
										key: "instance",
										isSet: true
									}
								]
							}
						]
					}
				]
			};

			// setup
			const action = ActivityActions.create({
				activityDescriptor: { model: "offer", instance: "offer/1" },
				loadingState: "without"
			});

			config.deepLinkCoder.decode.mock.mockImplementation(() => [action]);
			config.locationManager.getDeepLink.mock.mockImplementation(() => encodedDeepLink);

			// when
			const dispatched = await executeSaga(
				handleApplyDeepLink,
				createGeneralStore({ modules: [offerModule] }).store.getState(),
				config
			);

			// then
			strictEqual(config.deepLinkCoder.decode.mock.callCount(), 1);
			deepStrictEqual(config.deepLinkCoder.decode.mock.calls[0].arguments, [encodedDeepLink]);
			strictEqual(config.locationManager.setDeepLink.mock.callCount(), 0);

			strictEqual(dispatched.length, 1);
			deepStrictEqual(dispatched[0], action);
		});

		it("resets the deep link in case of error caused by decoder", async () => {
			// setup
			const config = createConfig();
			const activityMock = createActivity({ id: "activity1" });

			config.deepLinkCoder.decode.mock.mockImplementationOnce(() => {
				throw new Error("");
			});
			config.locationManager.getDeepLink.mock.mockImplementation(() => encodedDeepLink);

			// when
			await executeSaga(
				handleApplyDeepLink,
				createGeneralStore({ activities: [activityMock] }).store.getState(),
				config
			);

			// then
			strictEqual(config.locationManager.setDeepLink.mock.callCount(), 1);
			deepStrictEqual(config.locationManager.setDeepLink.mock.calls[0].arguments, [""]);
		});

		it("resets the deep link, if the datasourceActivity has the loadingState error", async () => {
			// setup
			const config = createConfig();
			const sourceActivityMock1 = createActivity({
				id: "activity1",
				dataHolders: [createDataHolder({ loadingState: "error" })]
			});

			const activityMock2 = createActivity({ id: "activity2" });

			const actions: Action<ActivityActions.PushPayload>[] = [
				{
					type: ActivityActions.push.type,
					payload: { activity: sourceActivityMock1 }
				},
				{
					type: ActivityActions.push.type,
					payload: { activity: activityMock2 }
				}
			];

			config.locationManager.getDeepLink.mock.mockImplementation(() => encodedDeepLink);
			config.deepLinkCoder.decode.mock.mockImplementation(() => actions);

			const activities = [sourceActivityMock1, activityMock2];

			// when
			await executeSaga(
				handleApplyDeepLink,
				createGeneralStore({ activities }).store.getState(),
				config
			);

			// then
			strictEqual(config.deepLinkCoder.decode.mock.callCount(), 1);
			deepStrictEqual(config.deepLinkCoder.decode.mock.calls[0].arguments, [encodedDeepLink]);

			strictEqual(config.locationManager.setDeepLink.mock.callCount(), 1);
			deepStrictEqual(config.locationManager.setDeepLink.mock.calls[0].arguments, [""]);
		});

		describe("given a minimal Configuration with only the deepLinkCoder", () => {
			it("uses a default locationManager", async () => {
				const locationSpy = mock.method(browserLocationManager, "getLocation");
				const configLocal: Configuration = {
					deepLinkCoder: new ActivityDescriptorBasedDeepLinkCoder()
				};
				const activityMock = createActivity({ id: "activity1" });

				await executeSaga(
					handleApplyDeepLink,
					createGeneralStore({ activities: [activityMock] }).store.getState(),
					configLocal
				);

				strictEqual(locationSpy.mock.callCount(), 1);
			});
		});

		describe("given an appmodel with an initial activity", () => {
			it("dispatches push action if no deeplink is set", async () => {
				const action1 = actionCreatorFactory("Test")<{ name?: string }>("ACTION_1");

				const configLocal: Configuration = {
					applyTriggers: [action1],
					deepLinkCoder: new ActivityDescriptorBasedDeepLinkCoder()
				};

				location.hash = "";
				const initialActivity = {
					descriptor: { model: "TestModel", instance: "true" }
				};

				const result = await executeSaga(
					handleApplyDeepLink,
					createGeneralStore({ initialActivity }).store.getState(),
					configLocal
				);

				const { activity } = result[0].payload as ActivityActions.PushPayload;
				deepStrictEqual(activity.descriptor, initialActivity.descriptor);
			});

			it("dispatches push action in case of error caused by decoder", async () => {
				const config = createConfig();
				const activityMock = createActivity({ id: "activity1" });

				config.deepLinkCoder.decode.mock.mockImplementationOnce(() => {
					throw new Error();
				});

				const initialActivity = {
					descriptor: { model: "TestModel", instance: "true" }
				};

				const dispatched = await executeSaga(
					handleApplyDeepLink,
					createGeneralStore({ activities: [activityMock], initialActivity }).store.getState(),
					config
				);

				const { activity } = dispatched[0].payload as ActivityActions.PushPayload;
				deepStrictEqual(activity.descriptor, initialActivity.descriptor);
			});
		});
	});

	describe("updateDeepLink", () => {
		describe("given a minimal Configuration", () => {
			it("calls handleUpdateDeepLink on push, cancel and setData action", () => {
				const config = createConfig();
				const saga = updateDeepLink(config);

				deepStrictEqual(
					saga.next().value,
					takeEvery(
						[
							ActivityActions.push,
							ActivityActions.cancel,
							ActivityActions.commit.done,
							ActivityActions.setData
						],
						handleUpdateDeepLink,
						config
					)
				);
				strictEqual(saga.next().done, true);
			});
		});

		describe("given a Configuration with updateTriggers", () => {
			it("reacts on an action out of those updateTriggers", () => {
				const dummyAction = actionCreatorFactory()<{ activityId: string }>("DUMMY");
				const configLocal: Configuration = {
					deepLinkCoder: new ActivityDescriptorBasedDeepLinkCoder(),
					updateTriggers: [dummyAction]
				};
				const saga = updateDeepLink(configLocal);

				deepStrictEqual(
					saga.next().value,
					takeEvery(
						[
							ActivityActions.push,
							ActivityActions.cancel,
							ActivityActions.commit.done,
							ActivityActions.setData,
							dummyAction
						],
						handleUpdateDeepLink,
						configLocal
					)
				);
				strictEqual(saga.next().done, true);
			});
		});
	});

	describe("applyDeepLink", () => {
		describe("given a minimal Configuration", () => {
			describe("with applyTriggers containing some action ", () => {
				it("calls navigateToActivity if one of these action get dispatched", () => {
					const action1 = actionCreatorFactory("Test")<{ name?: string }>("ACTION_1");
					const action2 = actionCreatorFactory("Test")<{ booleanVal?: boolean }>("ACTION_2");

					const configLocal: Configuration = {
						applyTriggers: [action1, action2]
					};
					const saga = applyDeepLink(configLocal);

					deepStrictEqual(
						saga.next().value,
						takeEvery([action1, action2], handleApplyDeepLink, configLocal)
					);
					strictEqual(saga.next().done, true);
				});
			});
		});
	});

	describe("clearDeepLink", () => {
		describe("given a minimal Configuration", () => {
			describe("with clearTriggers containing some action ", () => {
				it("resets the url hash if one of these action gets dispatched", async () => {
					const action1 = actionCreatorFactory("Test")<{ name?: string }>("ACTION_1");

					const configLocal: Configuration = {
						clearTriggers: [action1],
						deepLinkCoder: new ActivityDescriptorBasedDeepLinkCoder()
					};

					location.hash = "My test hash";

					return expectSaga(clearDeepLink, configLocal)
						.dispatch(action1)
						.silentRun()
						.then(() => {
							strictEqual(location.hash, "", "Expected an empty deep-link");
						});
				});
			});
		});
	});

	describe("loadWelcomePage", () => {
		describe("given a configuration with trigger actions", () => {
			it("calls handleLoadWelcomePage if one of these actions is dispatched", () => {
				const action1 = actionCreatorFactory("Test")<{ name?: string }>("ACTION_1");
				const action2 = actionCreatorFactory("Test")<{ booleanVal?: boolean }>("ACTION_2");

				const configLocal: Configuration = {
					applyTriggers: [action1, action2]
				};
				const saga = loadWelcomePage(configLocal);

				deepStrictEqual(saga.next().value, takeEvery([action1, action2], handleLoadWelcomePage));
				strictEqual(saga.next().done, true);
			});
		});
	});

	describe("handleLoadWelcomePage", () => {
		describe("given a minimal Configuration", () => {
			describe("with applyTriggers containing some action ", () => {
				it("does nothing if appmodel does not contain an initial activity", async () => {
					const action1 = actionCreatorFactory("Test")<{ name?: string }>("ACTION_1");

					const configLocal: Configuration = {
						applyTriggers: [action1]
					};

					const { effects } = await expectSaga(loadWelcomePage, configLocal)
						.withState(createGeneralStore().store.getState())
						.dispatch(action1)
						.silentRun();
					strictEqual(effects.put, undefined);
				});

				describe("if appmodel contains an initial activity that", () => {
					it("contains an activity descriptor, dispatches push action", async () => {
						const action1 = actionCreatorFactory("Test")<{ name?: string }>("ACTION_1");

						const configLocal: Configuration = {
							applyTriggers: [action1]
						};

						const initialActivity: ApplicationModel.InitialActivity = {
							descriptor: { model: "TestModel", instance: "true" }
						};

						const result = await executeSaga(
							handleLoadWelcomePage,
							createGeneralStore({ initialActivity }).store.getState(),
							configLocal
						);

						const { activity } = result[0].payload as ActivityActions.PushPayload;
						deepStrictEqual(activity.descriptor, initialActivity.descriptor);
					});

					it("contains an activity descriptor and the 'withoutData' flag, dispatches push action with loadingState 'without'", async () => {
						const action1 = actionCreatorFactory("Test")<{ name?: string }>("ACTION_1");

						const configLocal: Configuration = {
							applyTriggers: [action1]
						};

						const initialActivity: ApplicationModel.InitialActivity = {
							descriptor: { model: "TestModel", instance: "true" },
							withoutData: true
						};

						const result = await executeSaga(
							handleLoadWelcomePage,
							createGeneralStore({ initialActivity }).store.getState(),
							configLocal
						);

						const { activity } = result[0].payload as ActivityActions.PushPayload;
						deepStrictEqual(activity.descriptor, initialActivity.descriptor);
						deepStrictEqual(activity.dataHolders[0].loadingState, "without");
					});

					it("contains an activity descriptor not matching a scene and no 'withoutData' flag", async () => {
						const action1 = actionCreatorFactory("Test")<{ name?: string }>("ACTION_1");
						const mockLogger = mock.fn();
						Settings.LogStrategy = new MinLogLevelLoggingStrategy(
							{ digest: mockLogger },
							LogLevel.ERROR
						);

						const configLocal: Configuration = {
							applyTriggers: [action1]
						};

						const initialActivity: ApplicationModel.InitialActivity = {
							descriptor: { doesNotExist: "42" }
						};

						const result = await executeSaga(
							handleLoadWelcomePage,
							createGeneralStore({ initialActivity }).store.getState(),
							configLocal
						);

						strictEqual(result.length, 0);
						strictEqual(mockLogger.mock.callCount(), 1);
					});
				});
			});
		});
	});
});

async function executeSaga(
	saga: Saga,
	state: object,
	config: Configuration,
	sagaOptions?: RunSagaOptions<Action<object>, object>
): Promise<Action<object>[]> {
	const dispatched: Action<object>[] = [];
	await runSaga(
		{
			dispatch: (a: Action<object>) => dispatched.push(a),
			getState: () => state,
			...sagaOptions
		},
		saga,
		config
	).toPromise();
	return Promise.resolve(dispatched);
}
