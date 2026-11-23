// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { put, select } from "typed-redux-saga";
import type { Action } from "typescript-fsa";
import { isType } from "typescript-fsa";

import type { Activity } from "../../../activity/index.js";
import { ActivityActions, ActivityMap, ActivitySelectors } from "../../../activity/index.js";

import type { ApplicationSaga } from "./ApplicationSaga.js";

/** @internal */
export function cancelActivities(): ApplicationSaga.Descriptor {
	return {
		canHandle: (_ad: Activity.Descriptor, action: Action<{}>) => {
			return isType(action, ActivityActions.cancelRequested);
		},
		handle: (action: Action<ActivityActions.CancelRequestedPayload>) => {
			return handleCancelActivities(action);
		}
	};
}

/**
 * @internal
 *
 * This saga implements the default behavior for the cancelRequested action.
 * The saga orders all activities, which should be cancelled and cancels them
 * in this order.
 */
export function* handleCancelActivities({
	payload: { activityIds, replacementActivity }
}: Action<ActivityActions.CancelRequestedPayload>): SagaGenerator<void> {
	if (replacementActivity !== undefined && activityIds.length !== 1) {
		throw new Error(
			`It is not possible to provide a replacementActivity without providing exactly one activity to cancel`
		);
	}

	const activities = yield* select(ActivitySelectors.activities());
	// order the activities which should be cancelled
	const orderedActivityIdsToCancel: string[] = ActivityMap.toOrderedList(activities)
		.filter(activity => activityIds.includes(activity.id))
		.map(activity => activity.id);

	for (const activityId of orderedActivityIdsToCancel) {
		const activity = yield* select(ActivitySelectors.activityById(activityId));

		// if the activity is no longer in the store, continue
		if (activity === undefined) {
			continue;
		}

		const cancelPayload =
			replacementActivity !== undefined
				? { activityId: activity.id, replacementActivity }
				: { activityId: activity.id };

		yield* put(ActivityActions.cancel(cancelPayload));
	}

	yield* put(ActivityActions.responseCancelRequested({ cancelled: true }));
}

/** @internal */
export default {
	cancelActivities
};
