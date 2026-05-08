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
