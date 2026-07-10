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

import { strictEqual, deepStrictEqual } from "node:assert/strict";

import {
	Activity,
	ActivityActions,
	ActivityReducers,
	ActivitySelectors
} from "../../../../../core/activity/index.js";
import { createActivity } from "../../../../utils/activity.js";

import { selectActivity, setupState } from "../reducer-test-utils.js";
import type { MockTimerSetup } from "../timers.js";

export function executeTestForSetData(setup: MockTimerSetup): void {
	const { withTimeFreeze } = setup;

	describe("when the payload has a datasourceActivityId", () => {
		it(
			"returns a new ActivityMap, in which the activity with the id from the action payload " +
				"now has the data from the payload with " +
				"the loadingState 'loaded', the datasourceActivityId of the payload, and is not busy",
			() => {
				const action = ActivityActions.setData({
					activityId: "2",
					data: { hallo: "test" },
					datasourceActivityId: "1"
				});

				const actualActivityMap = withTimeFreeze(ActivityReducers.activities)(
					setupState([
						createActivity({ id: "1" }),
						createActivity({ id: "2", initiatingActivityId: "1" })
					]),
					action
				);

				const activity = selectActivity(actualActivityMap)("2")!;
				const loadingState = ActivitySelectors.loadingState(activity).state;
				strictEqual(loadingState, "loaded");
				const datasourceActivityId = Activity.findDefaultDataHolder(activity)?.datasourceActivityId;
				strictEqual(datasourceActivityId, "1");
				deepStrictEqual(Activity.findDefaultDataHolder(activity)?.data, {
					hallo: "test"
				});
			}
		);
	});

	describe("when the payload has no datasourceActivityId", () => {
		it(
			"returns a new ActivityMap, in which the activity with the id from the action payload " +
				"now has the data from the payload, the loadingState 'loaded', and " +
				"its original datasourceActivityId",
			() => {
				const action = ActivityActions.setData({
					activityId: "2",
					data: { hallo: "test" }
				});

				const actualActivityMap = ActivityReducers.activities(
					setupState([
						createActivity({
							id: "1"
						}),
						createActivity({
							id: "2",
							initiatingActivityId: "1",
							activityDataHolder: { datasourceActivityId: "1" }
						})
					]),
					action
				);

				const activity = selectActivity(actualActivityMap)("2")!;
				const datasourceActivityId = Activity.findDefaultDataHolder(activity)?.datasourceActivityId;
				strictEqual(datasourceActivityId, "1");
			}
		);
	});

	describe("when the payload has a dirty flag = true", () => {
		it(
			"returns a new ActivityMap, in which the activity with the id from the action payload " +
				"now has the data from the payload, the loadingState 'loaded', and " +
				"the default data holder dirty flag is equal to true",
			() => {
				const action = ActivityActions.setData({
					activityId: "2",
					data: { hallo: "test" },
					dirty: true
				});

				const actualActivityMap = ActivityReducers.activities(
					setupState([
						createActivity({
							id: "1"
						}),
						createActivity({
							id: "2",
							initiatingActivityId: "1",
							activityDataHolder: { datasourceActivityId: "1" }
						})
					]),
					action
				);

				const activity = selectActivity(actualActivityMap)("2")!;
				const isDirty = Activity.findDefaultDataHolder(activity)?.dirty;
				strictEqual(isDirty, true);
			}
		);
	});

	describe("when the payload has a dirty flag = false", () => {
		it(
			"returns a new ActivityMap, in which the activity with the id from the action payload " +
				"now has the data from the payload, the loadingState 'loaded', and " +
				"the default data holder dirty flag is false",
			() => {
				const activityMock = createActivity({
					id: "1",
					activityDataHolder: { dirty: true }
				});
				const action = ActivityActions.setData({
					activityId: "1",
					data: { hallo: "test" },
					dirty: false
				});

				const actualActivityMap = ActivityReducers.activities(setupState([activityMock]), action);

				const activity = selectActivity(actualActivityMap)("1")!;
				const isDirty = Activity.findDefaultDataHolder(activity)?.dirty;
				strictEqual(isDirty, false);
			}
		);
	});

	describe("when the payload does not have a dirty flag", () => {
		it(
			"returns a new ActivityMap, in which the activity with the id from the action payload " +
				"now has the data from the payload, the loadingState 'loaded', and " +
				"the default data holder dirty flag is unchanged",
			() => {
				const activityMock = createActivity({
					id: "1",
					activityDataHolder: { dirty: false }
				});
				const action = ActivityActions.setData({
					activityId: "1",
					data: { hallo: "test" }
				});

				const actualActivityMap = ActivityReducers.activities(setupState([activityMock]), action);

				const activity = selectActivity(actualActivityMap)("1")!;
				const isDirty = Activity.findDefaultDataHolder(activity)?.dirty;
				strictEqual(isDirty, false);
			}
		);
	});
}
