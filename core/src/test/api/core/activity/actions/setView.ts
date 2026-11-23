// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";

import { ActivityActions, ActivityReducers } from "../../../../../core/activity/index.js";

import { selectActivity, setupState } from "../reducer-test-utils.js";

export function executeTestForSetView(): void {
	it(
		"returns a new ActivityMap, in which the activity with the id from the action payload " +
			"now has the view from the payload",
		() => {
			const expectedView = "TestView";
			const action = ActivityActions.setCase({
				activityId: "1",
				case: expectedView
			});

			const actualActivityMap = ActivityReducers.activities(setupState(), action);

			const { case: caze } = selectActivity(actualActivityMap)("1")!;

			strictEqual(caze, expectedView);
		}
	);
}
