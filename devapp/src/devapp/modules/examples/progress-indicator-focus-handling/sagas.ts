// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { put, takeLatest } from "typed-redux-saga";
import type { Action, AnyAction } from "typescript-fsa";

import { ActivityActions } from "@com.mgmtp.a12.client/client-core";

export function* pushFocusHandlingActivity(): SagaGenerator<void> {
	yield* takeLatest(
		(action: AnyAction) =>
			ActivityActions.push.match(action) &&
			action.payload.activity.descriptor.feature === "FocusHandlingProgressIndicator" &&
			action.payload.activity.descriptor.instance !== undefined,
		handlePushFocusHandlingActivity
	);
}

function* handlePushFocusHandlingActivity(
	action: Action<ActivityActions.PushPayload>
): SagaGenerator<void> {
	const {
		payload: {
			activity: { id: activityId }
		}
	} = action;

	try {
		yield* put(ActivityActions.loadData({ activityId }));
	} catch (error) {
		yield* put(ActivityActions.error({ activityId, error, operationType: "loading" }));
	}
}
