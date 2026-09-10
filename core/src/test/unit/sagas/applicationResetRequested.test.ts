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

import { deepStrictEqual, notDeepStrictEqual, strictEqual } from "node:assert/strict";
import { type Mock, mock } from "node:test";

import { expectSaga } from "redux-saga-test-plan";
import { put } from "redux-saga/effects";
import type { AnyAction } from "typescript-fsa";
import { actionCreatorFactory } from "typescript-fsa";

import type { Activity } from "../../../core/activity/index.js";
import { ActivityActions, ActivitySagas } from "../../../core/activity/index.js";
import { applicationResetRequested } from "../../../core/application/internal/sagas/resetRequested.js";
import { createGeneralStore } from "../../mocks/store/store.js";
import { createActivity } from "../../utils/activity.js";

describe("extensions.dirtyHandling.internal.dirtyHandling", () => {
	describe("applicationResetRequested", () => {
		const action1 = actionCreatorFactory("Test")<{ name?: string }>("ACTION_1");
		const action2 = actionCreatorFactory("Test")<{ booleanVal?: boolean }>("ACTION_2");

		const resetConfirmedAction = actionCreatorFactory("Test")<{ name?: string }>("DONE");

		const triggers = [action1, action2];

		describe("If there are no activities in the store", () => {
			it("dispatches the 'resetConfirmed' action from the matching trigger action", () => {
				const activities: Activity[] = [];

				return expectSaga(applicationResetRequested, triggers, resetConfirmedAction)
					.dispatch(action2({ booleanVal: true }))
					.withState(createStoreForTesting(activities))
					.silentRun()
					.then(result => {
						const { effects } = result;

						notDeepStrictEqual(effects.put, undefined, "Put effects were expected");
						strictEqual(effects.put.length, 1);

						deepStrictEqual(effects.put[0], put(resetConfirmedAction));
					});
			});
		});

		describe("If there are activities in the store", () => {
			let waitForResponseSpy: Mock<(typeof ActivitySagas)["waitForResponseCancelRequested"]>;

			beforeEach(() => {
				waitForResponseSpy = mock.method(ActivitySagas, "waitForResponseCancelRequested");
			});

			it("dispatches ActivityAction.cancelRequested and does not dispatch the 'resetConfirmed' action if a veto gets returned", () => {
				const activityMockA = createActivity({
					id: "A",
					activationTimestamp: 1000,
					dirtyStateOfActivityDataHolder: true
				});
				const activities = [activityMockA];

				waitForResponseSpy.mock.resetCalls();

				return expectSaga(applicationResetRequested, triggers, resetConfirmedAction)
					.dispatch(action2({}))
					.withState(createStoreForTesting(activities))
					.dispatch(ActivityActions.responseCancelRequested({ cancelled: false }))
					.silentRun()
					.then(result => {
						const { effects } = result;

						notDeepStrictEqual(effects.put, undefined, "Put effects were expected");
						notDeepStrictEqual(effects.call, undefined, "Call effects were expected");
						strictEqual(effects.put.length, 1);
						strictEqual(effects.call.length, 2);

						deepStrictEqual(
							effects.put[0],
							put(ActivityActions.cancelRequested({ activityIds: ["A"] }))
						);

						strictEqual(waitForResponseSpy.mock.callCount(), 1);
					});
			});

			it("dispatches ActivityAction.cancelRequested and does dispatch the 'resetConfirmed' action if there is no veto", () => {
				const activityMockA = createActivity({
					id: "A",
					activationTimestamp: 1000,
					dirtyStateOfActivityDataHolder: true
				});
				const activities = [activityMockA];

				waitForResponseSpy.mock.resetCalls();
				return expectSaga(applicationResetRequested, triggers, resetConfirmedAction)
					.dispatch(action2({}))
					.withReducer(testReducer, createStoreForTesting(activities))
					.dispatch(ActivityActions.responseCancelRequested({ cancelled: true }))
					.silentRun()
					.then(result => {
						const { effects } = result;

						notDeepStrictEqual(effects.put, undefined, "Put effects were expected");
						notDeepStrictEqual(effects.call, undefined, "Call effects were expected");

						strictEqual(effects.put.length, 2, "Expected twp put effects");
						strictEqual(effects.call.length, 2, "Expected two call effects");

						deepStrictEqual(
							effects.put[0],
							put(ActivityActions.cancelRequested({ activityIds: ["A"] }))
						);

						deepStrictEqual(effects.put[1], put(resetConfirmedAction));

						strictEqual(waitForResponseSpy.mock.callCount(), 1);
					});
			});
		});
	});
});

function createStoreForTesting(activities: Activity[]): {} {
	const state: any = createGeneralStore().store.getState();
	for (const entry of activities) {
		state.activities[entry.id] = entry;
	}
	return state;
}

/*
 * Reducer to delete all activities from the store, if there was
 * a cancel or cancelRequested action
 */

function testReducer(state: any, action: AnyAction) {
	if (
		action.type === ActivityActions.cancel.type ||
		action.type === ActivityActions.cancelRequested.type
	) {
		return {
			...state,
			activities: {}
		};
	}

	return state;
}
