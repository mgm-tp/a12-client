// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { call, put, takeLatest } from "typed-redux-saga";
import type { Action } from "typescript-fsa";

import {
	ActivityActions,
	ActivitySagas,
	NotificationActions
} from "@com.mgmtp.a12.client/client-core";

import { cancelActivities } from "./dirtyHandlingFeatureActions.js";

/*
 * Saga to demonstrate how to cancel the requested activities and
 * execute code after the cancelling process
 */

export function* dirtyHandlingFeatureSaga(): SagaGenerator<void> {
	yield* takeLatest(cancelActivities, cancel);
}

function* cancel(action: Action<{ activityIds: string[] }>): SagaGenerator<void> {
	// cancel request for the activities
	yield* put(
		ActivityActions.cancelRequested({
			activityIds: action.payload.activityIds
		})
	);

	// wait for the response
	const cancelled = yield* call(ActivitySagas.waitForResponseCancelRequested);
	yield* put(
		NotificationActions.add({
			severity: cancelled ? "success" : "info",
			duration: 5000,
			position: "top-right",
			title: {
				key: `devapp.features.dirty-handling.cancel-${cancelled ? "success" : "abort"}`
			}
		})
	);
}
