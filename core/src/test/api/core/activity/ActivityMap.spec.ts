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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import { deepStrictEqual, strictEqual, throws } from "node:assert/strict";
import { mock } from "node:test";

import { Activity, ActivityMap } from "../../../../core/activity/index.js";
import { createActivity, createDataHolder } from "../../../utils/activity.js";

import { LIST_MOCK_ACTIVITIES, setupActivityMap } from "./util.js";

describe("core.activity", () => {
	describe("ActivityMap", () => {
		describe("toList", () => {
			describe("Given an ActivityMap with some activities", () => {
				it("returns an array which contains exactly the activities from the given ActivityMap", () => {
					const activities: Activity[] = [
						createActivity({ id: "1" }),
						createActivity({ id: "2" }),
						createActivity({ id: "3" }),
						createActivity({ id: "4" })
					];
					const list = ActivityMap.toList(setupActivityMap(activities));
					deepStrictEqual(list, activities);
				});
			});

			describe("Given an ActivityMap which is empty", () => {
				it("returns an empty array of activities", () => {
					const list = ActivityMap.toList({});
					deepStrictEqual(list, []);
				});
			});

			describe("Given an ActivityMap with one entry whose value is undefined", () => {
				it("returns an empty array of activities", () => {
					const list = ActivityMap.toList({ 1: undefined });
					deepStrictEqual(list, []);
				});
			});
		});

		describe("toOrderedList", () => {
			describe("Given an ActivityMap with multiple top-level activities with recursively nested child activities", () => {
				it("returns a list of all activities ordered by their relationship and the activationTimestamp", () => {
					const orderedList = ActivityMap.toOrderedList(setupActivityMap(LIST_MOCK_ACTIVITIES));
					deepStrictEqual(
						orderedList.map(activity => activity.id),
						["1", "2", "3", "1_1", "1_2", "3_1", "3_2", "1_2_1"]
					);
				});
			});

			describe("Given an ActivityMap which is empty", () => {
				it("returns an empty list of activities", () => {
					const orderedList = ActivityMap.toOrderedList({});
					deepStrictEqual(orderedList, []);
				});
			});
		});

		describe("applyActivityChange", () => {
			describe("Given an ActivityMap with some activities", () => {
				describe("and an activityId for an existing activity", () => {
					const activityId = "1_2_1";

					describe("and a change function which changes the activationTimestamp", () => {
						describe("returns a new ActivityMap object where the activity for the given activityId", () => {
							it("has its properties changed according to the given change function", () => {
								const expectedTimestamp = 123456;

								const activityMap = ActivityMap.applyActivityChange(
									setupActivityMap(LIST_MOCK_ACTIVITIES),
									activityId,
									activity => ({
										...activity,
										activationTimestamp: expectedTimestamp
									})
								);

								strictEqual(Object.keys(activityMap).length, LIST_MOCK_ACTIVITIES.length);
								strictEqual(activityMap[activityId]!.activationTimestamp, expectedTimestamp);
							});
						});

						it("checks the validity of the new ActivityMap", () => {
							const spy = mock.method(ActivityMap, "checkValidity");

							ActivityMap.applyActivityChange(
								setupActivityMap(LIST_MOCK_ACTIVITIES),
								activityId,
								activity => ({
									...activity,
									activationTimestamp: 999
								})
							);

							strictEqual(spy.mock.callCount(), 1);
						});
					});

					describe("and a change function returning undefined", () => {
						it("returns a new ActivityMap object where the activity for the given activityId has been removed", () => {
							const activityMap = ActivityMap.applyActivityChange(
								setupActivityMap(LIST_MOCK_ACTIVITIES),
								activityId,
								activity => undefined
							);

							strictEqual(Object.keys(activityMap).length, LIST_MOCK_ACTIVITIES.length - 1);
							strictEqual(activityMap[activityId], undefined);
						});

						it("checks the validity of the new ActivityMap", () => {
							const spy = mock.method(ActivityMap, "checkValidity");

							ActivityMap.applyActivityChange(
								setupActivityMap(LIST_MOCK_ACTIVITIES),
								activityId,
								activity => undefined
							);

							strictEqual(spy.mock.callCount(), 1);
						});
					});

					describe("and a change function that returns the original activity", () => {
						it("returns the given ActivityMap without any changes applied to it", () => {
							const originalActivityMap = setupActivityMap(LIST_MOCK_ACTIVITIES);

							const activityMap = ActivityMap.applyActivityChange(
								originalActivityMap,
								activityId,
								activity => activity
							);

							strictEqual(Object.keys(activityMap).length, LIST_MOCK_ACTIVITIES.length);
							strictEqual(activityMap, originalActivityMap);
						});
					});
				});

				describe("and an activityId for a non-existing activity and a change function for the given id", () => {
					it("returns the given ActivityMap without any changes applied to it", () => {
						const nonExistingActivityId = "abc";
						const changeFunc = mock.fn();
						const activityMap = ActivityMap.applyActivityChange(
							setupActivityMap(LIST_MOCK_ACTIVITIES),
							nonExistingActivityId,
							changeFunc
						);

						strictEqual(Object.keys(activityMap).length, LIST_MOCK_ACTIVITIES.length);
						strictEqual(changeFunc.mock.callCount(), 0);
						strictEqual(activityMap[nonExistingActivityId], undefined);
					});
				});
			});
		});

		describe("checkValidity", () => {
			it("returns given activityMap unchanged if it's empty", () => {
				const activityMap = setupActivityMap([]);

				deepStrictEqual(ActivityMap.checkValidity(activityMap), activityMap);
			});

			it("returns given activityMap unchanged if it contains only top-level activities", () => {
				const activityMap = setupActivityMap([
					createActivity({ id: "topLevel1" }),
					createActivity({ id: "topLevel2" }),
					createActivity({ id: "topLevel3" })
				]);

				deepStrictEqual(ActivityMap.checkValidity(activityMap), activityMap);
			});

			it("returns given activityMap unchanged if it does not contain any cycles or invalid references", () => {
				const activityMap = setupActivityMap([
					createActivity({ id: "topLevel1" }),
					createActivity({ id: "topLevel2" }),
					createActivity({ id: "child1", initiatingActivityId: "topLevel1" }),
					createActivity({
						id: "child2",
						initiatingActivityId: "topLevel1",
						dataHolders: [createDataHolder({ datasourceActivityId: "topLevel1" })]
					}),
					createActivity({
						id: "subchild1",
						initiatingActivityId: "child2",
						dataHolders: [createDataHolder({ datasourceActivityId: "topLevel1" })]
					})
				]);

				deepStrictEqual(ActivityMap.checkValidity(activityMap), activityMap);
			});

			it("throws an error if given activityMap contains an activity with a non-existing ancestor activity", () => {
				const activity = createActivity({ id: "1", initiatingActivityId: "doesNotExist" });
				const activityMap = setupActivityMap([activity]);

				throws(() => ActivityMap.checkValidity(activityMap), {
					message: `Initiating activity ${activity.initiatingActivityId} of activity ${activity.id} is missing.`
				});
			});

			it("throws an error if given activityMap contains an activity with a dataholder, which references a non-existing activity", () => {
				const datasourceActivityId = "doesNotExist";
				const activity = createActivity({
					id: "1",
					dataHolders: [createDataHolder({ datasourceActivityId })]
				});
				const activityMap = setupActivityMap([activity]);

				throws(() => ActivityMap.checkValidity(activityMap), {
					message: `DataSource activity ${datasourceActivityId} for a dataholder in activity ${activity.id} is missing.`
				});
			});

			it("throws an error if given activityMap contains an activity which references itself directly", () => {
				const activity = createActivity({
					id: "directCycle",
					initiatingActivityId: "directCycle"
				});
				const activityMap = setupActivityMap([activity]);

				throws(() => ActivityMap.checkValidity(activityMap), {
					message: new RegExp(`Activity ${activity.id} has a cyclic dependency`)
				});
			});

			it("throws an error if given activityMap contains an activity which references itself in-directly", () => {
				const activities = [
					createActivity({ id: "cycle1", initiatingActivityId: "cycle3" }),
					createActivity({ id: "cycle2", initiatingActivityId: "cycle1" }),
					createActivity({ id: "cycle3", initiatingActivityId: "cycle2" })
				];
				const activityMap = setupActivityMap(activities);

				throws(() => ActivityMap.checkValidity(activityMap), {
					message: new RegExp(`Activity ${activities[0].id} has a cyclic dependency`)
				});
			});
		});
	});

	describe("Activity", () => {
		describe("Error", () => {
			describe("isInstance", () => {
				describe("Given an Activity.Error object", () => {
					const activityError: Activity.Error = {
						errorCode: "INTERNAL_CLIENT_ERROR"
					};

					it("returns true", () => {
						strictEqual(Activity.Error.isInstance(activityError), true);
					});
				});

				describe("Given a native Error object", () => {
					it("returns false", () => {
						strictEqual(Activity.Error.isInstance(new Error("Native Error")), false);
					});
				});

				describe("Given an empty object", () => {
					it("returns false", () => {
						strictEqual(Activity.Error.isInstance({}), false);
					});
				});
			});
		});
	});
});
