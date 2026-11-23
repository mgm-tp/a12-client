// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { put } from "redux-saga/effects";
import type { SagaGenerator } from "typed-redux-saga";
import type { Action } from "typescript-fsa";
import { isType } from "typescript-fsa";

import type { Activity } from "../../../core/activity/index.js";
import { ActivityActions } from "../../../core/activity/index.js";
import type { ApplicationSaga } from "../../../core/application/index.js";

export function cancelSagaMock(): ApplicationSaga.Descriptor {
	return {
		canHandle: (
			ad: Activity.Descriptor,
			action: Action<ActivityActions.CancelRequestedPayload>
		) => {
			return isType(action, ActivityActions.cancelRequested);
		},
		handle: (action: Action<ActivityActions.CancelRequestedPayload>) => {
			return handleCancelSagaMock(action);
		}
	};
}

export function* handleCancelSagaMock(
	action: Action<ActivityActions.CancelRequestedPayload>
): SagaGenerator<void> {
	// Does not cancel but changes the dirty state
	yield put(
		ActivityActions.setDirty({
			activityId: action.payload.activityIds[0],
			dirty: true
		})
	);
}
