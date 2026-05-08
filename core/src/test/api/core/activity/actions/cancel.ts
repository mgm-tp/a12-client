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

import { deepStrictEqual, notStrictEqual, strictEqual } from "node:assert/strict";

import { ActivityActions, ActivityReducers } from "../../../../../core/activity/index.js";
import { createActivity } from "../../../../utils/activity.js";

import { setupState } from "../reducer-test-utils.js";
import type { MockTimerSetup } from "../timers.js";

export function executeTestForCancel(setup: MockTimerSetup): void {
	const { withTimeFreeze } = setup;

	describe("when the activity with the id from the payload is present in the previous ActivityMap", () => {
		it(
			"returns a new ActivityMap, in which this activity and all its related activities " +
				"are not present",
			() => {
				const activities = [
					createActivity({ id: "1" }),
					createActivity({ id: "2", initiatingActivityId: "1" }),
					createActivity({ id: "a" })
				];
				const action = ActivityActions.cancel({ activityId: "1" });

				const actualActivityMap = ActivityReducers.activities(setupState(activities), action);

				notStrictEqual(actualActivityMap["a"], undefined);
				strictEqual(actualActivityMap["1"], undefined);
				strictEqual(actualActivityMap["2"], undefined);
			}
		);

		it(
			"returns a new ActivityMap, in which this activity and all its related activities " +
				"are not present and the replacement activity is inserted",
			() => {
				const activities = [
					createActivity({ id: "1" }),
					createActivity({ id: "2", initiatingActivityId: "1" }),
					createActivity({ id: "a" })
				];
				const replacementActivity = createActivity({
					id: "replacement",
					activationTimestamp: setup.now()
				});
				const action = ActivityActions.cancel({
					activityId: "1",
					replacementActivity
				});

				const actualActivityMap = withTimeFreeze(ActivityReducers.activities)(
					setupState(activities),
					action
				);

				notStrictEqual(actualActivityMap["a"], undefined);
				deepStrictEqual(actualActivityMap["replacement"], replacementActivity);
				strictEqual(actualActivityMap["1"], undefined);
				strictEqual(actualActivityMap["2"], undefined);
			}
		);
	});

	describe("when the activity with the id from the payload is not present in the previous ActivityMap", () => {
		it("returns a new unmodified ActivityMap", () => {
			const activities = [
				createActivity({ id: "1" }),
				createActivity({ id: "2", initiatingActivityId: "1" }),
				createActivity({ id: "a" })
			];
			const state = setupState(activities);
			const action = ActivityActions.cancel({ activityId: "8" });

			const actualActivityMap = ActivityReducers.activities(state, action);

			deepStrictEqual(actualActivityMap, state);
		});
	});

	describe("when the activity with the id from the payload has an invalid initiatingActivityId", () => {
		it("returns a new ActivityMap without this activity", () => {
			const activities = [
				createActivity({ id: "1" }),
				createActivity({ id: "2", initiatingActivityId: "invalid" }),
				createActivity({ id: "a" })
			];
			const state = setupState(activities);
			const action = ActivityActions.cancel({ activityId: "2" });

			const actualActivityMap = ActivityReducers.activities(state, action);

			notStrictEqual(actualActivityMap["a"], undefined);
			notStrictEqual(actualActivityMap["1"], undefined);
			strictEqual(actualActivityMap["2"], undefined);
		});
	});
}
