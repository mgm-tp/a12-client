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

import { deepStrictEqual, strictEqual } from "node:assert/strict";

import type { Activity, ActivityMap } from "../../../../core/activity/index.js";
import { ActivitySelectors } from "../../../../core/activity/index.js";
import { createActivity, createDataHolder } from "../../../utils/activity.js";

import { LIST_MOCK_ACTIVITIES, setupActivityMap } from "./util.js";

describe("core.activity", () => {
	describe("ActivitySelectors", () => {
		describe("Note: all selector factories return functions which return the objects described below", () => {
			const activityMap = setupActivityMap(LIST_MOCK_ACTIVITIES);

			function setup(activities: ActivityMap): object {
				return { activities };
			}

			describe("activities", () => {
				const state = setup(activityMap);
				const activitiesFirstSelect = ActivitySelectors.activities()(state);
				const activitiesSecondSelect = ActivitySelectors.activities()(state);

				it("returns the ActivityMap object from a given ActivityStoreSlice", () => {
					// important to use strict equal ("===") here, because we want to make sure
					// that this selector is idempotent
					strictEqual(activitiesFirstSelect, activitiesSecondSelect);
				});
			});

			describe("activitiesByDescriptor", () => {
				describe("When ActivityStoreSlice has activities", () => {
					const state = setup(activityMap);

					describe("Given a descriptor matching one Activity in the given ActivityStoreSlice", () => {
						const expectedActivity = activityMap["1"] as Activity;
						const activities = ActivitySelectors.activitiesByDescriptor(
							expectedActivity.descriptor
						)(state);

						it("returns the list with one Activity matching the given activity descriptor", () => {
							deepStrictEqual(activities, [expectedActivity]);
						});
					});

					describe("Given a descriptor matching multiple activities in the given ActivityStoreSlice", () => {
						const expectedActivities = [activityMap["1_2"], activityMap["1_2_1"]] as Activity[];
						const activities = ActivitySelectors.activitiesByDescriptor(
							expectedActivities[0].descriptor
						)(state);

						it("returns the list of activities matching the given activity descriptor", () => {
							deepStrictEqual(activities, expectedActivities);
						});
					});

					describe("Given a descriptor not matching any Activity in the given ActivityStoreSlice", () => {
						const activities = ActivitySelectors.activitiesByDescriptor({
							model: "not-available-in-store"
						})(state);

						it("returns an empty array", () => {
							deepStrictEqual(activities, []);
						});
					});
				});

				describe("When ActivityStoreSlice has no activities", () => {
					const activities = ActivitySelectors.activitiesByDescriptor({
						model: "not-available-in-store"
					})(setup({}));

					it("returns an empty array", () => {
						deepStrictEqual(activities, []);
					});
				});
			});

			describe("activityById", () => {
				describe("When ActivityStoreSlice has activities", () => {
					const state = setup(activityMap);

					describe("Given an activity id matching an activity in the given ActivityStoreSlice", () => {
						const activityId = "1";
						const expectedActivity = activityMap[activityId];
						const activity = ActivitySelectors.activityById(activityId)(state);

						it("returns the activity matching the given activity id", () => {
							deepStrictEqual(activity, expectedActivity);
						});
					});

					describe("Given an activity id not matching an activity in the given ActivityStoreSlice", () => {
						const activityId = "abc";
						const expectedActivity = activityMap[activityId];
						const activity = ActivitySelectors.activityById(activityId)(state);

						it("returns undefined", () => {
							strictEqual(activity, undefined);
							deepStrictEqual(activity, expectedActivity);
						});
					});
				});

				describe("When ActivityStoreSlice has no activities", () => {
					const activity = ActivitySelectors.activityById("abc")(setup({}));

					it("returns undefined", () => {
						strictEqual(activity, undefined);
					});
				});
			});

			describe("childActivityWithInstance", () => {
				describe("When ActivityStoreSlice has activities", () => {
					const state = setup(activityMap);

					describe("Given a parent activity whose child activities all have an instance property in their descriptor objects", () => {
						const firstChildActivity = activityMap["3_1"];
						const activity = ActivitySelectors.childActivityWithInstance("3")(state);

						it(
							"returns the first child activity of the given parent activity found " +
								"with an instance property in the descriptor",
							() => {
								deepStrictEqual(activity, firstChildActivity);
							}
						);
					});

					describe("Given a parent activity whose child activities do not have an instance property in their descriptor", () => {
						const activity = ActivitySelectors.childActivityWithInstance("1")(state);

						it("returns undefined", () => {
							strictEqual(activity, undefined);
						});
					});
				});

				describe("When ActivityStoreSlice has no activities", () => {
					const activity = ActivitySelectors.childActivityWithInstance("1")(setup({}));

					it("returns undefined", () => {
						strictEqual(activity, undefined);
					});
				});
			});

			describe("latestActivity", () => {
				describe("When ActivityStoreSlice has activities", () => {
					// this is the activity with the latest activationTimestamp in the test data
					const latestActivity = activityMap["3_2"];
					const activity = ActivitySelectors.latestActivity()(setup(activityMap));

					it("returns the latest activity - the one with the latest activationTimestamp ", () => {
						deepStrictEqual(activity, latestActivity);
					});
				});

				describe("When ActivityStoreSlice has no activities", () => {
					const activity = ActivitySelectors.latestActivity()(setup({}));

					it("returns undefined", () => {
						strictEqual(activity, undefined);
					});
				});
			});

			describe("initiatingPath", () => {
				describe("When ActivityStoreSlice has activities", () => {
					const state = setup(activityMap);

					describe("Given an id of an activity that has prior activities", () => {
						const allPriorActivityIds = ActivitySelectors.initiatingPath("1_2_1")(state).map(
							activity => activity.id
						);

						it("returns an array of all prior activities", () => {
							deepStrictEqual(allPriorActivityIds, ["1", "1_2"]);
						});
					});

					describe("Given an id of an activity that has no prior activities", () => {
						const allPriorActivityIds = ActivitySelectors.initiatingPath("1")(state).map(
							activity => activity.id
						);

						it("returns an empty array", () => {
							deepStrictEqual(allPriorActivityIds, []);
						});
					});

					describe("Given an id of an activity that does not exist", () => {
						const allPriorActivityIds = ActivitySelectors.initiatingPath("DOES_NOT_EXIST")(
							state
						).map(activity => activity.id);

						it("returns an empty array", () => {
							deepStrictEqual(allPriorActivityIds, []);
						});
					});
				});
			});

			describe("topLevelActivities", () => {
				describe("When ActivityStoreSlice has activities", () => {
					const expectedTopLevelActivityIds = ["1", "2", "3"];
					const topLevelActivities = ActivitySelectors.topLevelActivities()(setup(activityMap));

					it(
						"returns all top level activity, i.e. all activities " +
							"that are not initiated by another activity and do not receive their data form another activity",
						() => {
							deepStrictEqual(Object.keys(topLevelActivities), expectedTopLevelActivityIds);
						}
					);
				});

				describe("When ActivityStoreSlice has no activities", () => {
					const topLevelActivities = ActivitySelectors.topLevelActivities()(setup({}));

					it("returns an empty ActivityMap object", () => {
						deepStrictEqual(topLevelActivities, {});
					});
				});
			});

			describe("activityByCancelConfirmationRequired", () => {
				it("returns an activity from the store which has cancelConfirmationRequired === true", () => {
					const activities: Activity[] = [
						createActivity({
							id: "A",
							activationTimestamp: 4,
							cancelConfirmationRequired: false
						}),
						createActivity({
							id: "B",
							activationTimestamp: 10,
							cancelConfirmationRequired: false
						}),
						createActivity({
							id: "C",
							activationTimestamp: 10,
							cancelConfirmationRequired: true
						})
					];

					const activityMapNew = setupActivityMap(activities);
					const state = setup(activityMapNew);

					const activity = ActivitySelectors.activityByCancelConfirmationRequired()(state);
					strictEqual(activity?.id, "C");
				});
			});

			describe("dataHolderByDescriptor", () => {
				describe("When ActivityStoreSlice has activities", () => {
					const first: Activity.DataHolderDescriptor = { number: "one" };
					const second: Activity.DataHolderDescriptor = { number: "two" };
					const activities: Activity[] = [
						createActivity({
							id: "A",
							activationTimestamp: 4,
							dataHolders: [
								createDataHolder({ descriptor: first }),
								createDataHolder({ descriptor: second })
							]
						})
					];
					const activitiesWithDataHolders = setupActivityMap(activities);
					const state = setup(activitiesWithDataHolders);

					describe("Given an activity id and descriptor matching a data holder of an activity in the given ActivityStoreSlice", () => {
						const activityId = "A";
						const dataHolder = ActivitySelectors.dataHolderByDescriptor(activityId, first)(state);

						it("returns the dataHolder matching the given activity id and descriptor", () => {
							deepStrictEqual(dataHolder?.descriptor, first);
						});
					});

					describe(
						"Given an activity id and a descriptor not matching a data holder of an activity " +
							"in the given ActivityStoreSlice",
						() => {
							const activityId = "A";
							const dataHolder = ActivitySelectors.dataHolderByDescriptor(activityId, {
								number: "third"
							})(state);

							it("returns undefined", () => {
								strictEqual(dataHolder, undefined);
							});
						}
					);
				});
			});
		});
	});

	describe("Selectors for specific activity properties", () => {
		describe("loadingState", () => {
			describe("Given an activity with a loading state that is not 'error'", () => {
				const loadingState: Activity.LoadingState = "loading";
				const activity = createActivity({
					id: "1",
					activityDataHolder: { loadingState }
				});
				const loadingStateDetails = ActivitySelectors.loadingState(activity);

				it("returns the loading state details of the given activity", () => {
					deepStrictEqual(loadingStateDetails, {
						state: loadingState,
						error: undefined
					});
				});
			});

			describe("Given an activity with a loading state that is 'error'", () => {
				const loadingState: Activity.LoadingState = "error";
				const error: Activity.Error.InternalClient = {
					errorCode: "INTERNAL_CLIENT_ERROR",
					message: "error occurred"
				};
				const activity = createActivity({
					id: "1",
					activityDataHolder: { loadingState, error }
				});
				const loadingStateDetails = ActivitySelectors.loadingState(activity);

				it("returns the loading state details (incl. the activity error) of the given activity", () => {
					deepStrictEqual(loadingStateDetails, {
						state: loadingState,
						error
					});
				});
			});
		});

		describe("savingState", () => {
			describe("Given an activity with a saving state that is not 'error'", () => {
				const savingState: Activity.SavingState = "saving";
				const activity = createActivity({
					id: "1",
					activityDataHolder: { savingState }
				});
				const savingStateDetails = ActivitySelectors.savingState(activity);

				it("returns the saving state details of the given activity", () => {
					deepStrictEqual(savingStateDetails, {
						state: savingState,
						error: undefined
					});
				});
			});

			describe("Given an activity with a saving state that is 'error'", () => {
				const savingState: Activity.SavingState = "error";
				const error: Activity.Error.InternalClient = {
					errorCode: "INTERNAL_CLIENT_ERROR",
					message: "error occurred"
				};
				const activity = createActivity({
					id: "1",
					activityDataHolder: { savingState, error }
				});
				const savingStateDetails = ActivitySelectors.savingState(activity);

				it("returns the saving state details (incl. the activity error) of the given activity", () => {
					deepStrictEqual(savingStateDetails, {
						state: savingState,
						error
					});
				});
			});
		});
	});
});
