// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
