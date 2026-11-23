// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual, deepStrictEqual } from "node:assert/strict";

import {
	Activity,
	ActivityActions,
	ActivityReducers,
	ActivitySelectors
} from "../../../../../core/activity/index.js";
import { createActivity } from "../../../../utils/activity.js";

import { selectActivity } from "../reducer-test-utils.js";
import { setupActivityMap } from "../util.js";

export function executeTestForClearError(): void {
	it(
		"returns a new ActivityMap, in which the activity with the id from the action payload " +
			"now has no error",
		() => {
			const state = setupActivityMap([
				createActivity({
					id: "1",
					activityDataHolder: {
						loadingState: "error",
						error: {
							errorCode: "INTERNAL_CLIENT_ERROR",
							message: new Error("hi").message
						}
					}
				})
			]);
			const action = ActivityActions.clearError({ activityId: "1" });

			const actualActivityMap = ActivityReducers.activities(state, action);

			const activity = selectActivity(actualActivityMap)("1")!;
			const error = Activity.findDefaultDataHolder(activity)?.error;

			strictEqual(error, undefined);
			strictEqual(ActivitySelectors.loadingState(activity).state, "error");
		}
	);

	it("returns a new unchanged ActivityMap if the activity does not need to be updated", () => {
		const state = setupActivityMap([
			createActivity({
				id: "1",
				activityDataHolder: {
					loadingState: "error",
					error: {
						errorCode: "INTERNAL_CLIENT_ERROR",
						message: new Error("hi").message
					}
				}
			})
		]);
		const action = ActivityActions.clearError({ activityId: "1" });

		// first execution of the reducer
		const updatedActivityMap = ActivityReducers.activities(state, action);

		// second execution does not change the map
		const actualActivityMap = ActivityReducers.activities(updatedActivityMap, action);
		deepStrictEqual(actualActivityMap, actualActivityMap);
	});
}
