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
