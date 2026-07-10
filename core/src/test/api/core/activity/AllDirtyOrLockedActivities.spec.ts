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

import type { Activity } from "../../../../core/activity/index.js";
import { ActivitySelectors } from "../../../../core/activity/index.js";
import { createActivity } from "../../../utils/activity.js";

import { cleanDataHolder, dirtyDataHolder, mockLock, setupState } from "./dirty-lock-fixtures.js";
import { setupActivityMap } from "./util.js";

describe("core.activity", () => {
	describe("ActivitySelectors", () => {
		describe("allDirtyOrLockedActivities", () => {
			describe("Given an activity A with multiple descendants", () => {
				it("returns an empty list if A and no children of A are dirty or locked", () => {
					const activities: Activity[] = [
						createActivity({ id: "A", activationTimestamp: 4 }),
						createActivity({
							id: "A1",
							activationTimestamp: 24,
							initiatingActivityId: "A",
							...cleanDataHolder
						}),
						createActivity({
							id: "A11",
							activationTimestamp: 52,
							initiatingActivityId: "A1",
							...cleanDataHolder
						}),
						createActivity({
							id: "A12",
							activationTimestamp: 53,
							initiatingActivityId: "A1",
							...cleanDataHolder
						}),
						createActivity({
							id: "A2",
							activationTimestamp: 53,
							initiatingActivityId: "A",
							...cleanDataHolder
						})
					];
					const activityMap = setupActivityMap(activities);
					const state = setupState(activityMap);
					const subTree = ActivitySelectors.allDirtyOrLockedActivities(activityMap["A"])(state);
					strictEqual(subTree.length, 0);
				});

				it("returns a list with A, if A is dirty", () => {
					const activities: Activity[] = [
						createActivity({ id: "A", activationTimestamp: 4, ...dirtyDataHolder }),
						createActivity({
							id: "A1",
							activationTimestamp: 24,
							initiatingActivityId: "A",
							...cleanDataHolder
						}),
						createActivity({
							id: "A11",
							activationTimestamp: 52,
							initiatingActivityId: "A1",
							...cleanDataHolder
						}),
						createActivity({
							id: "A12",
							activationTimestamp: 53,
							initiatingActivityId: "A1",
							...cleanDataHolder
						}),
						createActivity({
							id: "A2",
							activationTimestamp: 53,
							initiatingActivityId: "A",
							...cleanDataHolder
						})
					];
					const activityMap = setupActivityMap(activities);
					const state = setupState(activityMap);
					const subTree = ActivitySelectors.allDirtyOrLockedActivities(activityMap["A"])(state);
					strictEqual(subTree.length, 1);
					deepStrictEqual(
						subTree.map(a => a.id),
						["A"]
					);
				});

				it("returns a list with all dirty descendants of A", () => {
					const activities: Activity[] = [
						createActivity({ id: "A", activationTimestamp: 4, ...cleanDataHolder }),
						createActivity({
							id: "A1",
							activationTimestamp: 24,
							initiatingActivityId: "A",
							...cleanDataHolder
						}),
						createActivity({
							id: "A11",
							activationTimestamp: 52,
							initiatingActivityId: "A1",
							...dirtyDataHolder
						}),
						createActivity({
							id: "A12",
							activationTimestamp: 53,
							initiatingActivityId: "A1",
							...cleanDataHolder
						}),
						createActivity({
							id: "A2",
							activationTimestamp: 53,
							initiatingActivityId: "A",
							...dirtyDataHolder
						})
					];
					const activityMap = setupActivityMap(activities);
					const state = setupState(activityMap);
					const subTree = ActivitySelectors.allDirtyOrLockedActivities(activityMap["A"])(state);
					strictEqual(subTree.length, 2);
					deepStrictEqual(
						subTree.map(a => a.id),
						["A11", "A2"]
					);
				});

				it("returns an empty list if a not related activity of A is dirty", () => {
					const activities: Activity[] = [
						createActivity({ id: "A", activationTimestamp: 4, ...cleanDataHolder }),
						createActivity({ id: "B", activationTimestamp: 10, ...dirtyDataHolder }),
						createActivity({
							id: "A1",
							activationTimestamp: 24,
							initiatingActivityId: "A",
							...cleanDataHolder
						}),
						createActivity({
							id: "A11",
							activationTimestamp: 52,
							initiatingActivityId: "A1",
							...cleanDataHolder
						})
					];
					const activityMap = setupActivityMap(activities);
					const state = setupState(activityMap);
					const subTree = ActivitySelectors.allDirtyOrLockedActivities(activityMap["A"])(state);
					strictEqual(subTree.length, 0);
				});

				it("returns a list with A, if A is locked", () => {
					const activities: Activity[] = [
						createActivity({ id: "A", activationTimestamp: 4, ...cleanDataHolder, lock: mockLock }),
						createActivity({
							id: "A1",
							activationTimestamp: 24,
							initiatingActivityId: "A",
							...cleanDataHolder
						}),
						createActivity({
							id: "A11",
							activationTimestamp: 52,
							initiatingActivityId: "A1",
							...cleanDataHolder
						}),
						createActivity({
							id: "A12",
							activationTimestamp: 53,
							initiatingActivityId: "A1",
							...cleanDataHolder
						}),
						createActivity({
							id: "A2",
							activationTimestamp: 53,
							initiatingActivityId: "A",
							...cleanDataHolder
						})
					];
					const activityMap = setupActivityMap(activities);
					const state = setupState(activityMap);
					const subTree = ActivitySelectors.allDirtyOrLockedActivities(activityMap["A"])(state);
					strictEqual(subTree.length, 1);
					deepStrictEqual(
						subTree.map(a => a.id),
						["A"]
					);
				});

				it("returns a list with all locked descendants of A", () => {
					const activities: Activity[] = [
						createActivity({ id: "A", activationTimestamp: 4, ...cleanDataHolder }),
						createActivity({
							id: "A1",
							activationTimestamp: 24,
							initiatingActivityId: "A",
							...cleanDataHolder
						}),
						createActivity({
							id: "A11",
							activationTimestamp: 52,
							initiatingActivityId: "A1",
							...cleanDataHolder,
							lock: mockLock
						}),
						createActivity({
							id: "A12",
							activationTimestamp: 53,
							initiatingActivityId: "A1",
							...cleanDataHolder
						}),
						createActivity({
							id: "A2",
							activationTimestamp: 53,
							initiatingActivityId: "A",
							...cleanDataHolder,
							lock: mockLock
						})
					];
					const activityMap = setupActivityMap(activities);
					const state = setupState(activityMap);
					const subTree = ActivitySelectors.allDirtyOrLockedActivities(activityMap["A"])(state);
					strictEqual(subTree.length, 2);
					deepStrictEqual(
						subTree.map(a => a.id),
						["A11", "A2"]
					);
				});

				it("returns an empty list if a not related activity of A is locked", () => {
					const activities: Activity[] = [
						createActivity({ id: "A", activationTimestamp: 4, ...cleanDataHolder }),
						createActivity({
							id: "B",
							activationTimestamp: 10,
							...cleanDataHolder,
							lock: mockLock
						}),
						createActivity({
							id: "A1",
							activationTimestamp: 24,
							initiatingActivityId: "A",
							...cleanDataHolder
						}),
						createActivity({
							id: "A11",
							activationTimestamp: 52,
							initiatingActivityId: "A1",
							...cleanDataHolder
						}),
						createActivity({
							id: "A12",
							activationTimestamp: 53,
							initiatingActivityId: "A1",
							...cleanDataHolder
						}),
						createActivity({
							id: "A2",
							activationTimestamp: 53,
							initiatingActivityId: "A",
							...cleanDataHolder
						})
					];
					const activityMap = setupActivityMap(activities);
					const state = setupState(activityMap);
					const subTree = ActivitySelectors.allDirtyOrLockedActivities(activityMap["A"])(state);
					strictEqual(subTree.length, 0);
				});
			});

			describe("Given no specified activity", () => {
				it("returns an empty list, if no activity is dirty or locked", () => {
					const activities: Activity[] = [
						createActivity({ id: "A", activationTimestamp: 4, ...cleanDataHolder }),
						createActivity({ id: "B", activationTimestamp: 10, ...cleanDataHolder }),
						createActivity({
							id: "A1",
							activationTimestamp: 24,
							initiatingActivityId: "A",
							...cleanDataHolder
						}),
						createActivity({
							id: "A11",
							activationTimestamp: 52,
							initiatingActivityId: "A1",
							...cleanDataHolder
						}),
						createActivity({
							id: "A12",
							activationTimestamp: 53,
							initiatingActivityId: "A1",
							...cleanDataHolder
						}),
						createActivity({
							id: "A2",
							activationTimestamp: 53,
							initiatingActivityId: "A",
							...cleanDataHolder
						})
					];
					const activityMap = setupActivityMap(activities);
					const state = setupState(activityMap);
					const subTree = ActivitySelectors.allDirtyOrLockedActivities()(state);
					strictEqual(subTree.length, 0);
				});

				it("returns a list with all dirty or locked activities", () => {
					const activities: Activity[] = [
						createActivity({ id: "A", activationTimestamp: 4, ...dirtyDataHolder }),
						createActivity({ id: "B", activationTimestamp: 10, ...cleanDataHolder }),
						createActivity({
							id: "A1",
							activationTimestamp: 24,
							initiatingActivityId: "A",
							...cleanDataHolder,
							lock: mockLock
						}),
						createActivity({
							id: "A11",
							activationTimestamp: 52,
							initiatingActivityId: "A1",
							...dirtyDataHolder
						}),
						createActivity({
							id: "A12",
							activationTimestamp: 53,
							initiatingActivityId: "A1",
							...cleanDataHolder
						}),
						createActivity({
							id: "A2",
							activationTimestamp: 53,
							initiatingActivityId: "A",
							...cleanDataHolder
						}),
						createActivity({
							id: "B1",
							activationTimestamp: 52,
							initiatingActivityId: "B1",
							lock: mockLock
						})
					];
					const activityMap = setupActivityMap(activities);
					const state = setupState(activityMap);
					const subTree = ActivitySelectors.allDirtyOrLockedActivities()(state);
					strictEqual(subTree.length, 4);
					deepStrictEqual(
						subTree.map(a => a.id),
						["A", "A1", "A11", "B1"]
					);
				});
			});
		});
	});
});
