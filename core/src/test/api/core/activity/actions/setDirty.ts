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
