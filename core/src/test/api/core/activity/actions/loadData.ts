// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual, deepStrictEqual } from "node:assert/strict";

import {
	ActivityActions,
	ActivityReducers,
	ActivitySelectors
} from "../../../../../core/activity/index.js";

import { selectActivities, selectActivity, setupState } from "../reducer-test-utils.js";

export function executeTestForLoadData(): void {
	describe("and given that the old activity is different to the new activity", () => {
		it(
			"returns a new ActivityMap, in which the activity " +
				"with the id from the action payload now has the loadingState 'loading' and is busy",
			() => {
				const action = ActivityActions.loadData({
					activityId: "1"
				});

				const actualActivityMap = ActivityReducers.activities(setupState(), action);

				const activity = selectActivity(actualActivityMap)("1")!;
				const loadingState = ActivitySelectors.loadingState(activity).state;
				strictEqual(loadingState, "loading");
			}
		);
	});

	it("returns a new unchanged ActivityMap if the activity does not need to be updated", () => {
		const action = ActivityActions.loadData({
			activityId: "1"
		});

		const state = setupState();
		// first execution of the reducer
		const updatedActivityMap = selectActivities(ActivityReducers.activities(state, action));

		// second execution does not change the map
		const actualActivityMap = selectActivities(
			ActivityReducers.activities(updatedActivityMap, action)
		);
		deepStrictEqual(actualActivityMap, actualActivityMap);
	});
}
