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
