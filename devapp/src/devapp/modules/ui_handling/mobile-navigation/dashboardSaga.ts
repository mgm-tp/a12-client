// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { AnyAction } from "redux";
import type { SagaGenerator } from "typed-redux-saga";
import { put, takeLatest } from "typed-redux-saga";
import type { Action } from "typescript-fsa";

import { ActivityActions } from "@com.mgmtp.a12.client/client-core";

export function* createMultipleActivitiesForDashboard(): SagaGenerator<void> {
	yield* takeLatest(
		(a: AnyAction) =>
			ActivityActions.push.match(a) &&
			a.payload.activity.descriptor.feature === "DashboardLayout" &&
			a.payload.activity.descriptor.scene === "Dashboard",
		handleCreateMultipleActivitiesForDashboard
	);
}

function* handleCreateMultipleActivitiesForDashboard(
	action: Action<ActivityActions.PushPayload>
): SagaGenerator<void> {
	const actions = createCreateActions(action.payload.activity.id);
	for (const a of actions) {
		yield* put(a);
	}
}

export function createCreateActions(activityId: string): Action<ActivityActions.PushPayload>[] {
	return [
		ActivityActions.create({
			activityDescriptor: { tile: "Tile1" },
			loadingState: "without",
			initiatingActivityId: activityId
		}),
		ActivityActions.create({
			activityDescriptor: { tile: "Tile2" },
			loadingState: "without",
			initiatingActivityId: activityId
		}),
		ActivityActions.create({
			activityDescriptor: { model: "Person-document" },
			loadingState: "missing",
			initiatingActivityId: activityId
		})
	];
}
