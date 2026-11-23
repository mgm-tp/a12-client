// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
