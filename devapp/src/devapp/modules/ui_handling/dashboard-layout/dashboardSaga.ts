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
			a.payload.activity.descriptor.feature === "DashboardMultipleActivities",
		handleCreateMultipleActivitiesForDashboard
	);
}

function* handleCreateMultipleActivitiesForDashboard(
	action: Action<ActivityActions.PushPayload>
): SagaGenerator<void> {
	yield* put(
		ActivityActions.create({
			activityDescriptor: { tile: "MultipleActivitiesDashboardIntroTile" },
			loadingState: "without",
			initiatingActivityId: action.payload.activity.id
		})
	);
	yield* put(
		ActivityActions.create({
			activityDescriptor: { tile: "DashboardArticleTile" },
			loadingState: "missing",
			initiatingActivityId: action.payload.activity.id
		})
	);
	yield* put(
		ActivityActions.create({
			activityDescriptor: { model: "Person-document" },
			loadingState: "missing",
			initiatingActivityId: action.payload.activity.id
		})
	);
	yield* put(
		ActivityActions.create({
			activityDescriptor: { model: "Offer-document" },
			loadingState: "missing",
			initiatingActivityId: action.payload.activity.id
		})
	);
}
