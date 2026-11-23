// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual } from "node:assert/strict";

import { ActivityActions, ActivityReducers } from "../../../../../core/activity/index.js";
import { createActivity } from "../../../../utils/activity.js";

import { setupState } from "../reducer-test-utils.js";
import { setupActivityMap } from "../util.js";

export function executeTestForResponseCancelConfirmation(): void {
	it(
		"returns a new ActivityMap, in which the activity with the id from the action payload contains " +
			"undefined as 'cancelConfirmationRequired'",
		() => {
			const action = ActivityActions.responseCancelConfirmation({
				activityId: "1",
				veto: false
			});

			const initialActivity = createActivity({
				id: "1",
				cancelConfirmationRequired: false
			});

			const state = setupState([initialActivity]);
			const updatedActivityMap = ActivityReducers.activities(state, action);

			const expectedActivityMap = setupActivityMap([
				createActivity({ id: "1", cancelConfirmationRequired: undefined })
			]);
			deepStrictEqual(updatedActivityMap, expectedActivityMap);
		}
	);

	it("returns a new unchanged ActivityMap if the 'cancelConfirmationRequired' property in the activity is already set to undefined", () => {
		const action = ActivityActions.responseCancelConfirmation({
			activityId: "1",
			veto: false
		});

		const initialActivity = createActivity({
			id: "1",
			cancelConfirmationRequired: undefined
		});

		const state = setupState([initialActivity]);
		const updatedActivityMap = ActivityReducers.activities(state, action);

		const expectedActivityMap = setupActivityMap([
			createActivity({ id: "1", cancelConfirmationRequired: undefined })
		]);
		deepStrictEqual(updatedActivityMap, expectedActivityMap);
	});
}
