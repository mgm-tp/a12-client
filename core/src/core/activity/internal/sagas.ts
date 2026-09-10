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

// TODO: A12C-3195, SagaIterator to SagaGenerator
// eslint-disable-next-line no-restricted-imports
import type { SagaIterator } from "redux-saga";
import { call, put, select, take } from "typed-redux-saga";
import type { Action, AnyAction } from "typescript-fsa";

import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging/lib/factory.js";

import type { Selector } from "../../store/index.js";
import { StoreSagas } from "../../store/index.js";

import { ActivityActions } from "./actions.js";
import { ActivitySelectors } from "./selectors.js";

const logger = LoggerFactory.getLogger("core/activity");

export namespace ActivitySagas {
	/**
	 * This saga is called during dirty handling, after a setCancelConfirmationRequired was dispatched for an activity,
	 * and is used to react to a cancel confirmation by the user.
	 *
	 * @param activityId The id of the activity, for which should be reacted to a cancel confirmation.
	 */
	export function* waitForResponseCancelConfirmation(activityId: string): SagaIterator<boolean> {
		const responseAction = yield* take<Action<ActivityActions.ResponseCancelConfirmationPayload>>(
			(a: AnyAction) => {
				if (ActivityActions.responseCancelConfirmation.match(a)) {
					return a.payload.activityId === activityId;
				} else {
					return false;
				}
			}
		);

		return responseAction.payload.veto;
	}

	/**
	 * This saga handles responseCancelRequested actions and returns their payload
	 */
	export function* waitForResponseCancelRequested(): SagaIterator<boolean> {
		const responseAction = yield* take(ActivityActions.responseCancelRequested.match);

		return responseAction.payload.cancelled;
	}

	let LOCK_COUNTER = 0;

	/**
	 * This saga acquires a lock for the activity.
	 * If the activity is already locked, the saga waits and tries again until
	 * it gets the lock or until the activity is not in the store anymore
	 */
	export function* acquireActivityLock(
		activityId: string,
		owner: string,
		details: object
	): SagaIterator<string | undefined> {
		const id = String(LOCK_COUNTER++);
		logger.info(`SAGA: process activityId: ${activityId} with identifier: ${id} started`);

		let isNotMyLock = true;
		while (isNotMyLock) {
			yield* call(StoreSagas.waitForStateChange, activityUnlocked(activityId));
			logger.info(
				`SAGA: process activityId: ${activityId} with identifier: ${id} requests the lock`
			);
			yield* put(ActivityActions.lock({ activityId, id, owner, details }));

			const updatedActivity = yield* select(ActivitySelectors.activityById(activityId));
			if (updatedActivity === undefined) {
				logger.info(
					`SAGA: activity with id ${activityId} and identifier ${id} no longer exists, stopping saga`
				);
				return undefined;
			}
			isNotMyLock = updatedActivity.lock === undefined || updatedActivity.lock.id !== id;
		}
		logger.info(`SAGA: activity with id ${activityId} and identifier ${id} acquired the lock`);

		return id;
	}

	function activityUnlocked(
		activityId: string
	): Selector<{ stateChanged: boolean; returnValue: boolean }> {
		return state => {
			const activity = ActivitySelectors.activityById(activityId)(state);

			if (activity === undefined) {
				return { stateChanged: true, returnValue: false };
			}

			if (activity.lock === undefined) {
				return { stateChanged: true, returnValue: true };
			}

			return { stateChanged: false, returnValue: false };
		};
	}
}
