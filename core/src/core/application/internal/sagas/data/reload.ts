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

import type { SagaGenerator } from "typed-redux-saga";
import { call, put } from "typed-redux-saga";
import type { Action, AnyAction } from "typescript-fsa";

import type { Activity } from "../../../../activity/index.js";
import { ActivityActions, ActivitySagas, ActivitySelectors } from "../../../../activity/index.js";
import type { Selector } from "../../../../store/index.js";
import { StoreSagas } from "../../../../store/index.js";

import type { ApplicationSaga } from "../ApplicationSaga.js";

/** @internal */
export function reloadActivityDataSaga(): ApplicationSaga.Descriptor {
	return {
		canHandle: (_: Activity.Descriptor, action: AnyAction) =>
			ActivityActions.reloadData.match(action),
		handle: handleReloadActivityData
	};
}

function* handleReloadActivityData({
	payload
}: Action<ActivityActions.ActivityActionPayload>): SagaGenerator<void> {
	const { activityId } = payload;
	// set the lock in store (can be used by the UI)
	const lockId = yield* call(ActivitySagas.acquireActivityLock, activityId, "dataSagas.reload", {
		key: "Loading data"
	});

	if (lockId === undefined) {
		return;
	}

	yield* put(ActivityActions.loadData(payload));

	const done = yield* call(() => StoreSagas.waitForStateChange(loadedOrError(activityId)));

	if (done) {
		yield* put(ActivityActions.unlock({ activityId, lockId }));
	}
}

function loadedOrError(
	activityId: string
): Selector<{ stateChanged: boolean; returnValue: boolean }> {
	return state => {
		const activity = ActivitySelectors.activityById(activityId)(state);

		if (!activity) {
			return { stateChanged: true, returnValue: true };
		}

		const loadingState = ActivitySelectors.loadingState(activity);

		if (
			loadingState.state === "loaded" ||
			loadingState.state === "error" ||
			loadingState.state === "without"
		) {
			return { stateChanged: true, returnValue: true };
		}

		return { stateChanged: false, returnValue: false };
	};
}
