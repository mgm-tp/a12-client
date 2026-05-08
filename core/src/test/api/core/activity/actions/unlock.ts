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

import { strictEqual, deepStrictEqual } from "node:assert/strict";

import type { Activity } from "../../../../../core/activity/index.js";
import { ActivityActions, ActivityReducers } from "../../../../../core/activity/index.js";
import { createActivity } from "../../../../utils/activity.js";

import { selectActivity } from "../reducer-test-utils.js";
import { setupActivityMap } from "../util.js";

export function executeTestForUnlock(): void {
	it(
		"returns a new ActivityMap, in which the activity with the id from the action payload " +
			"now has no lock, if the correct lock id was supplied",
		() => {
			const lockId = "random lock id";
			const mockLock: Activity.Lock = {
				id: lockId,
				owner: "mock",
				details: { key: "mock processing" }
			};
			const action = ActivityActions.unlock({
				activityId: "1",
				lockId: lockId
			});
			const state = setupActivityMap([createActivity({ id: "1", lock: mockLock })]);
			const actualActivityMap = ActivityReducers.activities(state, action);

			const { lock } = selectActivity(actualActivityMap)("1")!;

			strictEqual(lock, undefined);
		}
	);

	it("returns the old unchanged ActivityMap, if not the correct lock id was supplied", () => {
		const lockId = "random lock id";
		const mockLock: Activity.Lock = {
			id: lockId,
			owner: "mock",
			details: { key: "mock processing" }
		};

		const state = setupActivityMap([createActivity({ id: "1", lock: mockLock })]);
		const action = ActivityActions.unlock({
			activityId: "1",
			lockId: "a wrong lock id"
		});

		deepStrictEqual(ActivityReducers.activities(state, action), state);
	});
}
