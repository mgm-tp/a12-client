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

import { expectSaga } from "redux-saga-test-plan";
import { put } from "redux-saga/effects";

import { actionCreatorFactory } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";

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
