// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual } from "node:assert/strict";

import { ActivityActions, ActivityReducers } from "../../../../../core/activity/index.js";
import { createActivity } from "../../../../utils/activity.js";

import { setupState } from "../reducer-test-utils.js";
import { setupActivityMap } from "../util.js";

export function executeTestForSetDirty(): void {
	describe("given a setDirty action with", () => {
		describe("'dirty' true", () => {
			it(
				"returns a new ActivityMap, in which the activity with the id from the action payload contains " +
					"true as 'dirty'",
				() => {
					const action = ActivityActions.setDirty({
						activityId: "1",
						dirty: true
					});

					const initialActivity = createActivity({
						id: "1",
						dirtyStateOfActivityDataHolder: false
					});

					const state = setupState([initialActivity]);
					const updatedActivityMap = ActivityReducers.activities(state, action);

					const expectedActivityMap = setupActivityMap([
						createActivity({ id: "1", dirtyStateOfActivityDataHolder: true })
					]);
					deepStrictEqual(updatedActivityMap, expectedActivityMap);
				}
			);
		});

		describe("'dirty' false", () => {
			it(
				"returns a new ActivityMap, in which the activity with the id from the action payload contains " +
					"false as 'cancelConfirmationRequired'",
				() => {
					const action = ActivityActions.setDirty({
						activityId: "1",
						dirty: false
					});

					const initialActivity = createActivity({
						id: "1",
						dirtyStateOfActivityDataHolder: true
					});

					const state = setupState([initialActivity]);
					const updatedActivityMap = ActivityReducers.activities(state, action);

					const expectedActivityMap = setupActivityMap([
						createActivity({ id: "1", dirtyStateOfActivityDataHolder: false })
					]);
					deepStrictEqual(updatedActivityMap, expectedActivityMap);
				}
			);
		});

		it("returns a new unchanged ActivityMap if the 'dirty' property in the activity has the same value as in the payload", () => {
			const action = ActivityActions.setDirty({
				activityId: "1",
				dirty: true
			});
			const initialActivity = createActivity({
				id: "1",
				dirtyStateOfActivityDataHolder: true
			});

			const state = setupState([initialActivity]);

			const updatedActivityMap = ActivityReducers.activities(state, action);

			const expectedActivityMap = setupActivityMap([
				createActivity({ id: "1", dirtyStateOfActivityDataHolder: true })
			]);

			deepStrictEqual(updatedActivityMap, expectedActivityMap);
		});
	});
}
