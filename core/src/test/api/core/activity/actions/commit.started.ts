// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual, strictEqual } from "node:assert/strict";

import {
	ActivityActions,
	ActivityReducers,
	ActivitySelectors
} from "../../../../../core/activity/index.js";
import { createActivity } from "../../../../utils/activity.js";

import { selectActivity } from "../reducer-test-utils.js";
import { setupActivityMap } from "../util.js";

export function executeTestForCommitStarted(): void {
	describe(" when the activity with the id from the action payload has the loadingState 'loaded'", () => {
		it(
			"returns a new ActivityMap, in which the activity with the id from the action payload " +
				"now has the savingState 'saving' and is busy",
			() => {
				const state = setupActivityMap([
					createActivity({
						id: "1",
						activityDataHolder: { loadingState: "loaded" }
					})
				]);
				const action = ActivityActions.commit.started({ activityId: "1" });

				const actualActivityMap = ActivityReducers.activities(state, action);

				const activity = selectActivity(actualActivityMap)("1")!;
				const savingState = ActivitySelectors.savingState(activity);
				strictEqual(savingState.state, "saving");
			}
		);

		it("returns a new unchanged ActivityMap if the activity does not need to be updated", () => {
			const state = setupActivityMap([
				createActivity({
					id: "1",
					activityDataHolder: { loadingState: "loaded" }
				})
			]);
			const action = ActivityActions.commit.started({ activityId: "1" });

			// first execution of the reducer
			const updatedActivityMap = ActivityReducers.activities(state, action);

			// second execution does not change the map
			const actualActivityMap = ActivityReducers.activities(updatedActivityMap, action);
			deepStrictEqual(actualActivityMap, actualActivityMap);
		});
	});

	describe(" when the activity with the id from the action payload doesn't have the loading state 'loaded'", () => {
		it("returns a new unchanged ActivityMap", () => {
			const state = setupActivityMap([
				createActivity({
					id: "1",
					activityDataHolder: { loadingState: "loading" }
				})
			]);
			const action = ActivityActions.commit.started({ activityId: "1" });

			deepStrictEqual(ActivityReducers.activities(state, action), state);
		});
	});

	describe("when the activity id in the payload is empty", () => {
		it("returns a new unchanged ActivityMap", () => {
			const state = setupActivityMap([
				createActivity({
					id: "1",
					activityDataHolder: { loadingState: "loaded" }
				})
			]);
			const action = ActivityActions.commit.started({ activityId: "" });

			deepStrictEqual(ActivityReducers.activities(state, action), state);
		});
	});
}
