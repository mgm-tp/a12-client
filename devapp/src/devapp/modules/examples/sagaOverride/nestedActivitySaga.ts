// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { put, select, takeLatest } from "typed-redux-saga";
import type { Action } from "typescript-fsa";
import { actionCreatorFactory } from "typescript-fsa";

import type { Activity } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ActivityMap, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";

const actionCreator = actionCreatorFactory("Features");

export const addNestedActivitySaga = actionCreator<ActivityActions.ActivityActionPayload>(
	"ADD_CUSTOM_NESTED_ACTIVITY_SAGA"
);

export function* nestedActivitySaga(): SagaGenerator<void> {
	yield* takeLatest(addNestedActivitySaga, handle);
}

function* handle(action: Action<ActivityActions.ActivityActionPayload>): SagaGenerator<void> {
	const { activityId } = action.payload;

	const descriptor = yield* select(
		ActivitySelectors.activityPropById(activityId, a => a.descriptor)
	);

	yield* put(
		ActivityActions.setData({
			activityId,
			data: {}
		})
	);

	yield* put(
		ActivityActions.create({
			activityDescriptor: { ...descriptor, instance: "1234567890" },
			loadingState: "without",
			initiatingActivityId: activityId
		})
	);

	const activities = yield* select(ActivitySelectors.activities());
	const allActivities: Activity[] = ActivityMap.toList(activities);
	const nestedActivity = allActivities.find(
		a => a.initiatingActivityId !== undefined && a.initiatingActivityId === activityId
	);

	if (nestedActivity) {
		yield* put(
			ActivityActions.setData({
				activityId: nestedActivity.id,
				data: { value: 132 },
				datasourceActivityId: activityId
			})
		);
	} else {
		throw new Error(`Add custom nested saga failed because a nested activity was NOT created.`);
	}
}
