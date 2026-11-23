// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
