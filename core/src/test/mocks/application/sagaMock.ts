// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { put, select, take } from "redux-saga/effects";
import type { SagaGenerator } from "typed-redux-saga";

import { ActivityActions, ActivitySelectors } from "../../../core/activity/index.js";

import { mockAction } from "./actionMocks.js";

export function* sagaMock(): SagaGenerator<void> {
	const action = yield take(mockAction.type);

	const activity = yield select(ActivitySelectors.activityById(action.payload.id));

	if (activity === undefined) {
		return;
	}

	yield put(
		ActivityActions.create({
			activityDescriptor: activity.descriptor,
			activityId: activity.id + activity.id
		})
	);
}
