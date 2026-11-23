// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual, strictEqual, throws } from "node:assert/strict";

import { Activity, ActivityActions, ActivityReducers } from "../../../../../core/activity/index.js";
import { createActivity } from "../../../../utils/activity.js";

import { selectActivity, setupState } from "../reducer-test-utils.js";
import type { MockTimerSetup } from "../timers.js";

export function executeTestForSetDataByDescriptor(setup: MockTimerSetup): void {
	const { withTimeFreeze } = setup;

	describe("when the payload has an existing data holder descriptor", () => {
		it(
			"returns a new ActivityMap, in which the activity with the id from the action payload " +
				"now has the data from the payload in the data holder with the descriptor from the payload with " +
				"the loadingState 'loaded', and is not busy",
			() => {
				const descriptor: Activity.DataHolderDescriptor = { model: "any" };
				const action = ActivityActions.setDataByDescriptor({
					activityId: "1",
					descriptor,
					data: { hallo: "test" }
				});

				const actualActivityMap = withTimeFreeze(ActivityReducers.activities)(
					setupState([createActivity({ id: "1", descriptor })]),
					action
				);

				const { dataHolders } = selectActivity(actualActivityMap)("1")!;

				const { loadingState, data, busy } = dataHolders.find(
					Activity.DataHolder.hasDescriptor(descriptor)
				)!;

				strictEqual(loadingState, "loaded");
				deepStrictEqual(data, { hallo: "test" });
				strictEqual(busy, false);
			}
		);
	});

	describe("when the payload has non-existing data holder descriptor", () => {
		it("throws an error stating that the requested data holder does not exist", () => {
			const descriptor: Activity.DataHolderDescriptor = { foo: "bar" };
			const action = ActivityActions.setDataByDescriptor({
				activityId: "1",
				descriptor,
				data: { hallo: "test" }
			});

			throws(() => withTimeFreeze(ActivityReducers.activities)(setupState(), action), {
				message: `No data holder found for the given descriptor ${JSON.stringify(descriptor, null, 2)}`
			});
		});
	});
}
