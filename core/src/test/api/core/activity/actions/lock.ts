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

import { deepStrictEqual } from "node:assert/strict";

import type { Activity } from "../../../../../core/activity/index.js";
import { ActivityActions, ActivityReducers } from "../../../../../core/activity/index.js";
import { createActivity } from "../../../../utils/activity.js";

import { selectActivity, setupState } from "../reducer-test-utils.js";
import { setupActivityMap } from "../util.js";

export function executeTestForLock(): void {
	it(
		"returns a new ActivityMap, in which the activity with the id from the action payload " +
			"now has a lock with user and details from the payload, if the activity is not already locked",
		() => {
			const expectedLock: Activity.Lock = {
				id: "totally random value",
				owner: "me",
				details: "data dirty"
			};
			const action = ActivityActions.lock({
				activityId: "1",
				...expectedLock
			});

			const actualActivityMap = ActivityReducers.activities(setupState(), action);

			const { lock } = selectActivity(actualActivityMap)("1")!;

			deepStrictEqual(lock, expectedLock);
		}
	);

	it("returns the old unchanged ActivityMap, if the activity is already locked", () => {
		const mockLock: Activity.Lock = {
			id: "totally random value",
			owner: "me",
			details: "data dirty"
		};

		const state = setupActivityMap([createActivity({ id: "1", lock: mockLock })]);

		const action = ActivityActions.lock({
			activityId: "1",
			...mockLock
		});

		deepStrictEqual(ActivityReducers.activities(state, action), state);
	});
}
