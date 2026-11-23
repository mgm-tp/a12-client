// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
