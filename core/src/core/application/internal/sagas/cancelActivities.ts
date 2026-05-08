/*
 * SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
 *
 * Copyright (c) 2012-2026 mgm technology partners GmbH
 *
 * Dual License
 * ------------
 * This source file is part of the mgm A12 Platform and available under
 * a choice of two different licenses:
 *
 * 1. Open-Source License – EUPL v1.2
 *    You may redistribute and/or modify this file under the terms of the
 *    European Union Public License, version 1.2 - see https://eupl.eu/.
 *
 * 2. Commercial License
 *    Alternatively, you may obtain a commercial license from
 *    mgm technology partners GmbH, that permits use of this software
 *    under different terms (including support and maintenance services).
 *
 *    Please contact a12-license@mgm-tp.com for more information.
 *
 * You must select and comply with exactly one of the above license options.
 *
 * Warranty Disclaimer (applies to either option)
 * ----------------------------------------------
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
		canHandle: (ad: Activity.Descriptor, action: Action<{}>) => {
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
