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
 * 1. Open-Source License - EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED "AS IS" AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import type { SagaGenerator } from "typed-redux-saga";
import { call, put, select } from "typed-redux-saga";
import type { Action } from "typescript-fsa";
import { isType } from "typescript-fsa";

import type { Activity } from "../../../core/activity/index.js";
import {
	ActivityActions,
	ActivityMap,
	ActivitySagas,
	ActivitySelectors
} from "../../../core/activity/index.js";
import type { ApplicationSaga } from "../../../core/application/index.js";

/** @internal */
export function dirtyHandlingSaga(): ApplicationSaga.Descriptor {
	return {
		canHandle: (ad: Activity.Descriptor, action: Action<{}>) => {
			return isType(action, ActivityActions.cancelRequested);
		},
		handle: (action: Action<ActivityActions.CancelRequestedPayload>) => {
			return handleDirtyState(action);
		}
	};
}

/**
 * The basic functionality of the dirty handling is as follows:
 * The activities, which are supposed to be cancelled are ordered from oldest to newest.
 * When processing them in this order, it can be that an activity from the list, get already cancelled
 * when an ancestor gets cancelled.
 * Therefore we have to check on each iteration, if the activity is still existing.
 * If the activity still exists, it will be tested, if the activity is dirty or locked
 * and if any descendants of the activity is dirty or locked. If this is the case, a user interaction
 * is required, to decide, if the dirty or locked activities can be cancelled (no veto) or if the whole process should
 * be aborted (veto).
 *
 * @internal
 */
export function* handleDirtyState({
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

		const dirtySubTree = yield* select(ActivitySelectors.allDirtyOrLockedActivities(activity));

		const cancelPayload =
			replacementActivity !== undefined
				? { activityId: activity.id, replacementActivity }
				: { activityId: activity.id };

		if (dirtySubTree.length > 0) {
			// dispatch an setVeto action which should be handled by a saga
			yield* put(
				ActivityActions.setCancelConfirmationRequired({
					activityId: activity.id,
					cancelConfirmationRequired: true
				})
			);

			const veto = yield* call(ActivitySagas.waitForResponseCancelConfirmation, activity.id);

			if (veto) {
				yield* put(ActivityActions.responseCancelRequested({ cancelled: false }));
				return;
			} else {
				yield* put(ActivityActions.cancel(cancelPayload));
			}
		} else {
			yield* put(ActivityActions.cancel(cancelPayload));
		}
	}

	yield* put(ActivityActions.responseCancelRequested({ cancelled: true }));
}
