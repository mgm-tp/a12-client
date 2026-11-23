// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { select, takeEvery } from "typed-redux-saga";
import type { Action } from "typescript-fsa";

import type { Activity } from "../../../activity/index.js";
import { ActivitySelectors } from "../../../activity/index.js";

import type { ApplicationSaga } from "./ApplicationSaga.js";

/**
 * @internal
 * For now, we assume that all actions should be handled/dispatched by the dispatcher.
 * That means, that there is no cancellation of already running sagas happening if
 * actions occur multiple times shortly after another. Thus, we make use of the
 * takeEvery effect below.
 * If a different behavior is required, the dispatcher saga should either be replaced
 * or an alternative dispatcher should be used instead.
 */
export default function* watchDispatchSaga(
	sagas: ApplicationSaga.Descriptor[] = []
): SagaGenerator<void> {
	yield* takeEvery(() => true, dispatch, sagas);
}

function* dispatch(sagas: ApplicationSaga.Descriptor[], action: Action<{}>) {
	let activityDescriptor: Activity.Descriptor;
	if (isActionWithActivityDescriptor(action)) {
		activityDescriptor = action.payload.activityDescriptor;
	} else {
		const activity = isActionWithActivityId(action)
			? yield* select(ActivitySelectors.activityById(action.payload.activityId))
			: yield* select(ActivitySelectors.latestActivity());

		activityDescriptor = activity !== undefined ? activity.descriptor : { model: "" };
	}

	const firstMatchingSaga = sagas.find(saga => saga.canHandle(activityDescriptor, action));
	if (firstMatchingSaga !== undefined) {
		yield firstMatchingSaga.handle(action);
	}
}

function isActionWithActivityId(action: Action<{}>): action is Action<{ activityId: string }> {
	// TODO: improve check for Activity
	if (!action.type.startsWith("Activity/")) {
		return false;
	}
	const activityAction = action as Action<{ activityId: string }>;
	return activityAction.payload.activityId !== undefined;
}

function isActionWithActivityDescriptor(
	action: Action<{}>
): action is Action<{ activityDescriptor: Activity.Descriptor }> {
	// TODO: improve check for Activity
	if (!action.type.startsWith("Activity/")) {
		return false;
	}
	const activityAction = action as Action<{
		activityDescriptor: Activity.Descriptor;
	}>;
	return activityAction.payload.activityDescriptor !== undefined;
}
