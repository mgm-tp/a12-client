// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual } from "node:assert/strict";

import { ActivityActions, ActivityReducers } from "../../../../../core/activity/index.js";
import { createActivity } from "../../../../utils/activity.js";

import { setupState } from "../reducer-test-utils.js";
import type { MockTimerSetup } from "../timers.js";

export function executeTestForCommitDone(setup: MockTimerSetup): void {
	it(
		"returns a new ActivityMap, in which the activity with the id from the action payload " +
			"is not present",
		() => {
			const state = setupState();
			const action = ActivityActions.commit.done({
				params: { activityId: "1" },
				result: {}
			});

			deepStrictEqual(ActivityReducers.activities(state, action), {});
		}
	);

	it(
		"returns a new ActivityMap, in which the activity with the id from the action payload " +
			"is not present and the replacement activity is inserted",
		() => {
			const state = setupState();

			const replacementActivity = createActivity({
				id: "replacement",
				activationTimestamp: setup.now()
			});
			const action = ActivityActions.commit.done({
				params: { activityId: "1", replacementActivity },
				result: {}
			});
			const activityMap = setup.withTimeFreeze(ActivityReducers.activities)(state, action);

			deepStrictEqual(activityMap, {
				replacement: replacementActivity
			});
		}
	);

	it(
		"returns a new unchanged ActivityMap, if the activityId from the action payload " + "is empty",
		() => {
			const state = setupState();
			const action = ActivityActions.commit.done({
				params: { activityId: "" },
				result: {}
			});

			deepStrictEqual(ActivityReducers.activities(state, action), state);
		}
	);
}
