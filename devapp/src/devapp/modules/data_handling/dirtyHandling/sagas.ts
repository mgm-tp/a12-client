// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { all, put, takeLatest } from "typed-redux-saga";
import type { Action, AnyAction } from "typescript-fsa";

import type { Activity } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions } from "@com.mgmtp.a12.client/client-core";

import { initializeDataHolders as initializeDataHoldersForDirtyDataHandling } from "./dirtyHandlingFeatureActions.js";

export const DESCRIPTOR: Activity.Descriptor = {
	feature: "DirtyHandlingFeature",
	detail: "true"
};

export function* startDirtyHandlingExampleSaga(): SagaGenerator<void> {
	yield* takeLatest(
		(action: AnyAction) =>
			ActivityActions.push.match(action) &&
			action.payload.activity.descriptor.feature === "DirtyHandling",
		handleStartDirtyHandlingExampleSaga
	);
}

function* handleStartDirtyHandlingExampleSaga(
	action: Action<ActivityActions.PushPayload>
): SagaGenerator<void> {
	const {
		payload: {
			activity: { id: activityId }
		}
	} = action;

	const createPayloads: ActivityActions.CreatePayload[] = [
		{
			activityDescriptor: DESCRIPTOR,
			activityId: "A",
			initiatingActivityId: activityId,
			loadingState: "without"
		},
		{
			activityDescriptor: DESCRIPTOR,
			activityId: "B",
			initiatingActivityId: activityId,
			loadingState: "without"
		},
		// create another two activities which are descendants of B
		{
			activityDescriptor: DESCRIPTOR,
			initiatingActivityId: "B",
			activityId: "B1",
			loadingState: "without"
		},

		{
			activityDescriptor: DESCRIPTOR,
			initiatingActivityId: "B",
			activityId: "B2",
			loadingState: "without"
		},
		{
			activityDescriptor: DESCRIPTOR,
			activityId: "C",
			loadingState: "without",
			initiatingActivityId: activityId
		}
	];

	yield* all(createPayloads.map(p => put(ActivityActions.create(p))));
}

export function* initializeDataHolders(): SagaGenerator<void> {
	yield* takeLatest(
		(action: AnyAction) =>
			ActivityActions.push.match(action) &&
			action.payload.activity.descriptor.feature === "DirtyHandlingFeature" &&
			action.payload.activity.id === "C",
		handleInitializeDataHolders
	);
}

function* handleInitializeDataHolders(
	action: Action<ActivityActions.PushPayload>
): SagaGenerator<void> {
	const {
		payload: {
			activity: { id: activityId }
		}
	} = action;

	yield* put(initializeDataHoldersForDirtyDataHandling({ activityId, instances: ["C1"] }));
}
