// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual, notDeepStrictEqual, strictEqual } from "node:assert/strict";

import { expectSaga } from "redux-saga-test-plan";
import { put } from "redux-saga/effects";
import { actionCreatorFactory } from "typescript-fsa";

import type { Activity } from "../../../core/activity/index.js";
import { applicationReset } from "../../../core/application/internal/sagas/reset.js";
import { StoreActions } from "../../../core/store/index.js";
import { createGeneralStore } from "../../mocks/store/store.js";
import { createActivity } from "../../utils/activity.js";

describe("extensions.dirtyHandling.internal.dirtyHandling", () => {
	describe("applicationReset", () => {
		it("dispatches StoreActions.reset", () => {
			const action1 = actionCreatorFactory("Test")<{ name?: string }>("ACTION_1");
			const action2 = actionCreatorFactory("Test")<{ booleanVal?: boolean }>("ACTION_2");

			const triggers = [action1, action2];

			const activityMockA = createActivity({
				id: "A",
				activationTimestamp: 1000
			});
			const activities = [activityMockA];

			return expectSaga(applicationReset, triggers)
				.dispatch(action2({}))
				.withState(createStoreForTesting(activities))
				.silentRun()
				.then(result => {
					const { effects } = result;

					notDeepStrictEqual(effects.put, undefined, "Put effects were expected");
					strictEqual(effects.put.length, 1, "Expected one put effect");
					deepStrictEqual(effects.put[0], put(StoreActions.resetState()));
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
