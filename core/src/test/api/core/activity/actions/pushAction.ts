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

import { deepStrictEqual, notStrictEqual, strictEqual } from "node:assert/strict";

import { Activity, ActivityActions, ActivityReducers } from "../../../../../core/activity/index.js";
import { createActivity } from "../../../../utils/activity.js";

import { setupState } from "../reducer-test-utils.js";
import type { MockTimerSetup } from "../timers.js";

export function executeTestForPushAction(setup: MockTimerSetup): void {
	function pushAction(activityId: string, activationTimestamp?: number) {
		return ActivityActions.push({
			activity: createActivity({ id: activityId, activationTimestamp })
		});
	}

	function prepareMock(activityId: string, activationTimestamp: number | undefined) {
		return { id: activityId, activationTimestamp };
	}

	const { withTimeFreeze, now } = setup;

	describe("when ActivityMap is empty", () => {
		it("returns a new ActivityMap with the activity from the action payload added", () => {
			const nextActivityId = "1";
			const activities = ActivityReducers.activities({}, pushAction(nextActivityId));
			deepStrictEqual(Object.keys(activities), [nextActivityId]);
		});
	});

	describe("when the latest activity in the ActivityMap has an old activationTimestamp", () => {
		it(
			"returns a new ActivityMap including the activity from the action payload with the current time " +
				" as activationTimestamp, making it the new latest activity",
			() => {
				const latestActivityId = "1";
				const nextActivityId = "2";

				const activities = withTimeFreeze(ActivityReducers.activities)(
					setupState([createActivity(prepareMock(latestActivityId, now(-1000)))]),
					pushAction(nextActivityId)
				);
				strictEqual(activities[nextActivityId]!.activationTimestamp, now());
			}
		);
	});

	describe("when ActivityMap has a latest activity, that has a newer activationTimestamp", () => {
		it(
			"returns a new ActivityMap including the activity from the action payload with the an " +
				"activationTimestamp, that makes it the latest activity",
			() => {
				const latestActivityId = "1";
				const nextActivityId = "2";

				const activities = withTimeFreeze(ActivityReducers.activities)(
					setupState([createActivity(prepareMock(latestActivityId, now(+1000)))]),
					pushAction(nextActivityId, now(-1000))
				);
				const { activationTimestamp } = activities[nextActivityId]!;

				strictEqual(activationTimestamp, now(1001));
				strictEqual(activationTimestamp > activities[latestActivityId]!.activationTimestamp, true);
			}
		);
	});

	describe("when ActivityMap has a latest activity, whose id is the same as the one from the actions payload", () => {
		it("returns a new ActivityMap with an updated latest activity", () => {
			const activityId = "1";

			const activities = withTimeFreeze(ActivityReducers.activities)(
				setupState([createActivity(prepareMock(activityId, now(+1000)))]),
				pushAction(activityId)
			);
			strictEqual(activities[activityId]!.activationTimestamp, now());
		});
	});

	describe("when activity from the action payload has a default data holder", () => {
		it("does not add a new data holder", () => {
			const nextActivityId = "1";
			const activities = ActivityReducers.activities({}, pushAction(nextActivityId));
			strictEqual(activities[nextActivityId]?.dataHolders.length, 1);
		});
	});

	describe("when activity from the action payload has no data holders", () => {
		it("adds a default data holder", () => {
			const nextActivityId = "1";
			const activities = ActivityReducers.activities(
				{},
				ActivityActions.push({
					activity: {
						...createActivity({ id: nextActivityId }),
						dataHolders: []
					}
				})
			);
			strictEqual(activities[nextActivityId]?.dataHolders.length, 1);

			const defaultDataHolder = Activity.findDefaultDataHolder(activities[nextActivityId]);
			notStrictEqual(defaultDataHolder, undefined);
		});
	});

	describe("when activity from the action payload has numeric value as id", () => {
		it("updates the activityIdCounter to the latest id if its greater than the counter", () => {
			ActivityActions.activityIdCounter = 6;
			const activity = createActivity({ id: "7" });
			ActivityReducers.activities(
				{},
				ActivityActions.push({
					activity
				})
			);
			strictEqual(ActivityActions.activityIdCounter, 7);
		});

		it("leaves the activityIdCounter unchanged if latest id is not greater than the counter", () => {
			ActivityActions.activityIdCounter = 8;

			const activity = createActivity({ id: "7" });
			ActivityReducers.activities(
				{},
				ActivityActions.push({
					activity
				})
			);
			strictEqual(ActivityActions.activityIdCounter, 8);
		});
	});

	describe("when activity from the action payload has non-numeric value as id", () => {
		it("leaves the activityIdCounter unchanged", () => {
			ActivityActions.activityIdCounter = 10;

			const activity = createActivity({ id: "non numeric" });
			ActivityReducers.activities(
				{},
				ActivityActions.push({
					activity
				})
			);
			strictEqual(ActivityActions.activityIdCounter, 10);
		});
	});
}
