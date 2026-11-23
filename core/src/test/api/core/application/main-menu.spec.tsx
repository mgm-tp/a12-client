// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual, strictEqual } from "node:assert/strict";
import { mock } from "node:test";

import { LogLevel, MinLogLevelLoggingStrategy, Settings } from "@com.mgmtp.a12.utils/utils-logging";

import type { Activity } from "../../../../core/activity/index.js";
import { ActivityActions, ActivitySelectors } from "../../../../core/activity/index.js";
import { ApplicationActions, ModuleTestExtensions } from "../../../../core/application/index.js";
import type { ApplicationModel } from "../../../../core/model/index.js";
import {
	createAppModel,
	createContent,
	createFlow,
	createModule,
	createScene
} from "../../../utils/appmodel-utils.js";
import { createApplicationSetup } from "../../../utils/test-utils.js";

describe("core.application", () => {
	after(ModuleTestExtensions.reset);

	describe("Main-Menu Saga", () => {
		describe("When ApplicationActions.startMainActivityRequested action is dispatched", () => {
			describe("Given an initialActivity with a descriptor matching a scene with the loadData flag", () => {
				const initialActivity: ApplicationModel.InitialActivity = {
					descriptor: { feature: "sceneWithLoadData" }
				};
				it("pushes a new activity with the given descriptor as payload and performs data loading", async () => {
					const { store, waitFor } = createApplicationSetup({ appModel: setupAppModel() });

					store.dispatch(ApplicationActions.startMainActivityRequested(initialActivity));

					await waitFor(state => {
						assertLatestActivity(state, initialActivity.descriptor, "loaded");
					});
				});
			});

			describe("Given an initialActivity with a descriptor matching a scene without models and without loadData flag", () => {
				const initialActivity: ApplicationModel.InitialActivity = {
					descriptor: {
						feature: "scene"
					}
				};
				it("pushes a new activity with the given descriptor as payload and performs no data loading", async () => {
					const { store, waitFor } = createApplicationSetup({ appModel: setupAppModel() });

					store.dispatch(ApplicationActions.startMainActivityRequested(initialActivity));

					await waitFor(state => {
						assertLatestActivity(state, initialActivity.descriptor, "without");
					});
				});
			});

			describe("Given an initialActivity with a descriptor matching a scene and 'withoutData' set", () => {
				const initialActivity: ApplicationModel.InitialActivity = {
					descriptor: { feature: "sceneWithLoadData" },
					withoutData: true
				};

				it("pushes a new activity with the given descriptor as payload and performs no data loading", async () => {
					const { store, waitFor } = createApplicationSetup({ appModel: setupAppModel() });

					store.dispatch(ApplicationActions.startMainActivityRequested(initialActivity));

					await waitFor(state => {
						assertLatestActivity(state, initialActivity.descriptor, "without");
					});
				});
			});

			describe("Given a descriptor matching a scene with models", () => {
				const activityDescriptor: Activity.Descriptor = {
					feature: "sceneWithModels"
				};
				describe("When there are no activities in the store", () => {
					it("pushes a new activity with the given descriptor as payload and performs data loading", async () => {
						const { store, waitFor } = createApplicationSetup({ appModel: setupAppModel() });

						const allTopLevelActivities = ActivitySelectors.topLevelActivities()(store.getState());
						store.dispatch(
							ActivityActions.cancelRequested({
								activityIds: Object.keys(allTopLevelActivities)
							})
						);
						await waitFor(state => {
							deepStrictEqual(ActivitySelectors.topLevelActivities()(state), {});
						});

						store.dispatch(
							ApplicationActions.startMainActivityRequested({ descriptor: activityDescriptor })
						);
						await waitFor(state => {
							assertLatestActivity(state, activityDescriptor, "loaded");
						});
					});
				});

				describe("When there is already an activity in the store", () => {
					const prevActivityId = "1";
					const prevActivityDescriptor: Activity.Descriptor = {
						feature: "scene"
					};

					it("cancels the activity from the store and then pushes the new activity with given descriptor", async () => {
						const { store, waitFor } = createApplicationSetup({ appModel: setupAppModel() });

						store.dispatch(
							ActivityActions.create({
								activityId: prevActivityId,
								activityDescriptor: prevActivityDescriptor
							})
						);
						store.dispatch(
							ApplicationActions.startMainActivityRequested({ descriptor: activityDescriptor })
						);

						await waitFor(state => {
							const prevActivity = ActivitySelectors.activityById(prevActivityId)(state);
							strictEqual(prevActivity, undefined);
							assertLatestActivity(state, activityDescriptor, "loaded");
						});
					});
				});
			});

			describe("Given an initialActivity not matching a scene and and 'withoutData' not set", () => {
				const initialActivity: ApplicationModel.InitialActivity = {
					descriptor: { feature: "doesNotExists" }
				};

				it("does not push a new activity and logs error", async () => {
					const { store, waitFor } = createApplicationSetup({ appModel: setupAppModel() });
					const mockLogger = mock.fn();
					Settings.LogStrategy = new MinLogLevelLoggingStrategy(
						{ digest: mockLogger },
						LogLevel.ERROR
					);

					store.dispatch(ApplicationActions.startMainActivityRequested(initialActivity));

					await waitFor(state => {
						strictEqual(mockLogger.mock.callCount(), 1);
						const activities = ActivitySelectors.activitiesByDescriptor(initialActivity.descriptor)(
							state
						);
						strictEqual(activities.length, 0);
					});
				});
			});
		});
	});
});

function setupAppModel() {
	return createAppModel({
		content: createContent({
			modules: [
				createModule({
					flows: [
						createFlow({
							scenes: [
								createScene({
									name: "s1",
									matchConditions: [
										{
											key: "feature",
											mustEqual: "scene"
										}
									],
									onEnterDirectives: [
										{
											type: "VIEW_ADD",
											name: "View"
										}
									]
								}),
								createScene({
									name: "s2",
									matchConditions: [
										{
											key: "feature",
											mustEqual: "sceneWithLoadData"
										}
									],
									onEnterDirectives: [
										{
											type: "VIEW_ADD",
											name: "View",
											loadData: true
										}
									]
								}),
								createScene({
									name: "s3",
									matchConditions: [
										{
											key: "feature",
											mustEqual: "sceneWithModels"
										}
									],
									onEnterDirectives: [
										{
											type: "VIEW_ADD",
											name: "View",
											models: [
												{
													modelType: "document",
													name: "Mock-document"
												}
											]
										}
									]
								})
							]
						})
					]
				})
			]
		})
	});
}

function assertLatestActivity(
	state: object,
	descriptor: Activity.Descriptor,
	loadingState: Activity.LoadingState
): void {
	const latestActivity = ActivitySelectors.latestActivity()(state);
	if (latestActivity === undefined) {
		throw new Error(`No activity has been created.`);
	}
	deepStrictEqual(latestActivity.descriptor, descriptor);
	strictEqual(ActivitySelectors.loadingState(latestActivity).state, loadingState);
}
