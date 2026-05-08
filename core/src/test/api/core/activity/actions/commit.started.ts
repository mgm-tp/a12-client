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
