// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { call, put } from "typed-redux-saga";
import type { Action, AnyAction, Success } from "typescript-fsa";

import type { Activity } from "../../../../activity/index.js";
import { ActivityActions, ActivitySelectors } from "../../../../activity/index.js";

import type { ApplicationSaga } from "../ApplicationSaga.js";
import { ActivityUtils } from "../utils.js";

/** @internal */
export function pushActivitySaga(): ApplicationSaga.Descriptor {
	return {
		canHandle: (_: Activity.Descriptor, action: AnyAction) => ActivityActions.push.match(action),
		handle: (action: Action<ActivityActions.PushPayload>) =>
			handlePushActivity(action.payload.activity)
	};
}

/** @internal */
export function cancelActivitySaga(): ApplicationSaga.Descriptor {
	return {
		canHandle: (_: Activity.Descriptor, action: AnyAction) =>
			ActivityActions.cancel.match(action) && action.payload.replacementActivity !== undefined,
		handle: (action: Action<Required<ActivityActions.CancelPayload>>) =>
			handlePushActivity(action.payload.replacementActivity)
	};
}

/** @internal */
export function commitDoneActivitySaga(): ApplicationSaga.Descriptor {
	return {
		canHandle: (_: Activity.Descriptor, action: AnyAction) =>
			ActivityActions.commit.done.match(action) &&
			action.payload.params.replacementActivity !== undefined,
		handle: (action: Action<Success<Required<ActivityActions.CommitPayload>, {}>>) =>
			handlePushActivity(action.payload.params.replacementActivity)
	};
}

function* handlePushActivity(activity: Activity): SagaGenerator<void> {
	try {
		const activityLoadingState = ActivitySelectors.loadingState(activity).state;
		if (activityLoadingState === "missing") {
			yield* put(ActivityActions.loadData({ activityId: activity.id }));
		}
	} catch (error) {
		yield* call(ActivityUtils.handleError, activity.id, "loading", error);
	}
}
