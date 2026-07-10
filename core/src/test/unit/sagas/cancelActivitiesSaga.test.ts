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

import { deepStrictEqual } from "node:assert/strict";

import type { RunSagaOptions } from "redux-saga";
import { runSaga } from "redux-saga";

import type { Action } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";

import type { Activity } from "../../../core/activity/index.js";
import { ActivityActions } from "../../../core/activity/index.js";
import { handleCancelActivities } from "../../../core/application/internal/sagas/cancelActivities.js";
import { createGeneralStore } from "../../mocks/store/store.js";
import { createActivity } from "../../utils/activity.js";

describe("core.application.internal.sagas.cancelRequestedHandling", () => {
	describe("Given a map of activities", () => {
		it("cancels them in the right order", async () => {
			const cancelRequestedAction = ActivityActions.cancelRequested({
				activityIds: ["A", "A1", "B", "C"]
			});

			const activityMockA = createNewActivity("A", undefined, 1000, false);
			const activityMockA1 = createNewActivity("A1", "A", 500, false);
			const activityMockB = createNewActivity("B", undefined, 300, false);
			const activityMockC = createNewActivity("C", undefined, 200, false);
			const activities = [activityMockA, activityMockA1, activityMockB, activityMockC];

			const expectedActions: Action<{}>[] = [
				ActivityActions.cancel({ activityId: "C" }),
				ActivityActions.cancel({ activityId: "B" }),
				ActivityActions.cancel({ activityId: "A" }),
				ActivityActions.cancel({ activityId: "A1" }),
				ActivityActions.responseCancelRequested({ cancelled: true })
			];
			const dispatched = await executeHandleCancelRequestedSaga(cancelRequestedAction, activities);
			deepStrictEqual(dispatched, expectedActions);
		});
	});
});

function createNewActivity(
	id: string,
	initiatingActivityId?: string,
	activationTimestamp = 0,
	dirty = false
): Activity {
	return createActivity({
		id,
		initiatingActivityId,
		activationTimestamp,
		dataHolders: [
			{
				descriptor: {},
				data: {},
				dirty,
				loadingState: "missing",
				savingState: "not_saved",
				slices: {}
			}
		]
	});
}

async function executeHandleCancelRequestedSaga(
	action: Action<{}>,
	activities: Activity[]
): Promise<Action<{}>[]> {
	const dispatched = await executeSaga(handleCancelActivities, action, activities);

	return Promise.resolve(dispatched);
}

async function executeSaga(
	saga: any,
	action: Action<{}>,
	activities: Activity[],
	sagaOptions?: RunSagaOptions<Action<{}>, object>
): Promise<Action<{}>[]> {
	const state: any = createGeneralStore().store.getState();
	for (const entry of activities) {
		state.activities[entry.id] = entry;
	}

	const dispatched: Action<{}>[] = [];
	await runSaga(
		{
			dispatch: (a: Action<{}>) => dispatched.push(a),
			getState: () => state,
			...sagaOptions
		},
		saga,
		action
	).toPromise();
	return Promise.resolve(dispatched);
}
