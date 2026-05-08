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

import { expectSaga } from "redux-saga-test-plan";
import { put } from "redux-saga/effects";
import type { AnyAction } from "typescript-fsa";
import { actionCreatorFactory } from "typescript-fsa";

import type { Activity, ActivityMap } from "../../../../core/activity/index.js";
import {
	ActivityActions,
	ActivityReducers,
	ActivitySagas,
	ActivitySelectors
} from "../../../../core/activity/index.js";
import type { Selector } from "../../../../core/store/index.js";
import { StoreSagas } from "../../../../core/store/index.js";
import { createGeneralStore } from "../../../mocks/store/store.js";
import { createActivity } from "../../../utils/activity.js";

const actionFactory = actionCreatorFactory("MockAction");
const releaseLockAction = actionFactory<{ activityId: string }>("RELEASE_LOCK_ACTION");

describe("core.activity.sagas", () => {
	describe("waitForStateChange", () => {
		function testFunction(
			activityId: string
		): Selector<{ stateChanged: boolean; returnValue: string }> {
			return state => {
				const activity = ActivitySelectors.activityById(activityId)(state);
				if (activity === undefined || ActivitySelectors.loadingState(activity).state !== "loaded") {
					return { stateChanged: false, returnValue: "not done" };
				} else {
					return { stateChanged: true, returnValue: "done" };
				}
			};
		}

		describe("Execute waitForStateChange with predicate function testFunction", () => {
			it("directly returns the returnValue if the store is already in the desired state", async () => {
				const activityMockA = createActivity({
					id: "A",
					activityDataHolder: { loadingState: "loaded" }
				});
				const activities = [activityMockA];

				return expectSaga(StoreSagas.waitForStateChange, testFunction("A"))
					.withReducer(
						reducerWaitForStateChange,
						createGeneralStore({ activities }).store.getState()
					)
					.returns("done")
					.run()
					.then(result => {
						const { effects } = result;

						strictEqual(effects.take, undefined);
						notStrictEqual(effects.select, undefined);
						strictEqual(effects.select.length, 1); // one for each action and one before the loop
					});
			});

			it("calls testFunction until it returns true and returns the returnValue", async () => {
				const activityMockA = createActivity({
					id: "A",
					activityDataHolder: { loadingState: "loading" }
				});
				const activities = [activityMockA];

				return expectSaga(StoreSagas.waitForStateChange, testFunction("A"))
					.withReducer(
						reducerWaitForStateChange,
						createGeneralStore({ activities }).store.getState()
					)
					.dispatch(ActivityActions.setData({ activityId: "A", data: {} }))
					.returns("done")
					.run()
					.then(result => {
						const { effects } = result;

						notStrictEqual(effects.take, undefined);
						notStrictEqual(effects.select, undefined);
						strictEqual(effects.take.length, 1); // one action gets dispatched
						strictEqual(effects.select.length, 2); // one for each action and one before the loop
					});
			});
		});
	});

	describe("acquireActivityLock", () => {
		const lockPayload = {
			activityId: "A",
			owner: "me",
			details: { key: "something" }
		};
		let LOCK_ID = 0;
		afterEach(() => {
			LOCK_ID++;
		});

		it("returns the lock, if the activity is not locked", () => {
			const activityMockA = createActivity({ id: lockPayload.activityId });
			const activities = [activityMockA];
			return expectSaga(
				ActivitySagas.acquireActivityLock,
				lockPayload.activityId,
				lockPayload.owner,
				lockPayload.details
			)
				.withReducer(reducerForLockAndUnlock, createGeneralStore({ activities }).store.getState())
				.returns(String(LOCK_ID))
				.run()
				.then(result => {
					const { effects } = result;

					notStrictEqual(effects.put, undefined);
					notStrictEqual(effects.call, undefined);

					strictEqual(effects.put.length, 1);
					strictEqual(effects.call.length, 2);

					deepStrictEqual(
						effects.put[0],
						put(ActivityActions.lock({ ...lockPayload, id: String(LOCK_ID) }))
					);

					deepStrictEqual(effects.call[0].payload.fn.name, "waitForStateChange");
				});
		});

		it("returns undefined, if the activity is not in the state", () => {
			const activities: Activity[] = [];

			return expectSaga(
				ActivitySagas.acquireActivityLock,
				lockPayload.activityId,
				lockPayload.owner,
				lockPayload.details
			)
				.withState(createGeneralStore({ activities }).store.getState())
				.returns(undefined)
				.run();
		});

		it("waits until the activity is unlocked and then tries to lock it", () => {
			// already locked activity
			const activityMockA = createActivity({
				id: lockPayload.activityId,
				lock: { id: "-1", owner: "you", details: { key: "something" } }
			});
			const activities = [activityMockA];

			const state = createGeneralStore({ activities }).store.getState();

			return expectSaga(
				ActivitySagas.acquireActivityLock,
				lockPayload.activityId,
				lockPayload.owner,
				lockPayload.details
			)
				.withReducer(reducerForLockAndUnlock, state)
				.dispatch(releaseLockAction({ activityId: lockPayload.activityId }))
				.returns(String(LOCK_ID))
				.run()
				.then(result => {
					const { effects } = result;

					notStrictEqual(effects.put, undefined);
					strictEqual(effects.put.length, 1);
				});
		});

		it("tries to lock, until it gets the lock", () => {
			const activityMockA = createActivity({
				id: lockPayload.activityId
			});

			const activities = [activityMockA];

			return expectSaga(
				ActivitySagas.acquireActivityLock,
				lockPayload.activityId,
				lockPayload.owner,
				lockPayload.details
			)
				.withReducer(reducerForMultipleTries, createGeneralStore({ activities }).store.getState())
				.returns(String(LOCK_ID))
				.run()
				.then(result => {
					const { effects } = result;

					notStrictEqual(effects.put, undefined);
					strictEqual(effects.put.length, 3);
				});
		});
	});
});

/**
 * Reducer sets the loadingState
 */
function reducerWaitForStateChange(
	state: object | { activities: ActivityMap } = {},
	action: AnyAction
) {
	if (ActivityActions.setData.match(action)) {
		const activity = ActivitySelectors.activityById(action.payload.activityId)(state);

		if (activity !== undefined) {
			const nextActivities = ActivityReducers.activities(
				"activities" in state ? state.activities : {},
				action
			);
			return {
				...state,
				activities: nextActivities
			};
		}
	}
	return state;
}

/**
 * Reducer locks an activity, if the action ActivityAction.lock is dispatched
 * Reducer unlocks an activity, if the action ActivityAction.releaseLockAction is dispatched
 */
function reducerForLockAndUnlock(state: object = {}, action: AnyAction) {
	const activities = ActivitySelectors.activities()(state);

	if (ActivityActions.lock.match(action)) {
		const activity = activities[action.payload.activityId];
		const newState = {
			...state,
			activities: {
				...activities,
				[action.payload.activityId]: {
					...activity,
					lock: {
						owner: action.payload.owner,
						details: action.payload.details,
						id: action.payload.id
					}
				}
			}
		};

		return newState;
	} else if (releaseLockAction.match(action)) {
		const activity = activities[action.payload.activityId];
		const newState = {
			...state,
			activities: {
				...activities,
				[action.payload.activityId]: {
					...activity,
					lock: undefined
				}
			}
		};

		return newState;
	}
	return state;
}

/**
 * Reducer which locks an activity after 3 tries
 */
let TRY_COUNTER = 1;
function reducerForMultipleTries(state: object = {}, action: AnyAction) {
	const activities = ActivitySelectors.activities()(state);
	if (ActivityActions.lock.match(action) && TRY_COUNTER++ >= 3) {
		const activity = activities[action.payload.activityId];
		const newActivities = {
			...activities,
			[action.payload.activityId]: {
				...activity,
				lock: {
					owner: action.payload.owner,
					details: action.payload.details,
					id: action.payload.id
				}
			}
		};

		const newState = {
			...state,
			activities: newActivities
		};
		return newState;
	}

	return state;
}
