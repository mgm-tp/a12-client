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
import { call, put } from "typed-redux-saga";
import type { Action, AnyAction, Success } from "typescript-fsa";

import type { Activity } from "../../../../activity/index.js";
import { ActivityActions, ActivitySelectors } from "../../../../activity/index.js";

import type { ApplicationSaga } from "../ApplicationSaga.js";
import { ActivityUtils } from "../utils.js";

/** @internal */
export function pushActivitySaga(): ApplicationSaga.Descriptor {
	return {
		canHandle: (_: Activity.Descriptor, action: AnyAction) => ActivityActions.push.match(action),
		handle: (action: Action<ActivityActions.PushPayload>) =>
			handlePushActivity(action.payload.activity)
	};
}

/** @internal */
export function cancelActivitySaga(): ApplicationSaga.Descriptor {
	return {
		canHandle: (_: Activity.Descriptor, action: AnyAction) =>
			ActivityActions.cancel.match(action) && action.payload.replacementActivity !== undefined,
		handle: (action: Action<Required<ActivityActions.CancelPayload>>) =>
			handlePushActivity(action.payload.replacementActivity)
	};
}

/** @internal */
export function commitDoneActivitySaga(): ApplicationSaga.Descriptor {
	return {
		canHandle: (_: Activity.Descriptor, action: AnyAction) =>
			ActivityActions.commit.done.match(action) &&
			action.payload.params.replacementActivity !== undefined,
		handle: (action: Action<Success<Required<ActivityActions.CommitPayload>, {}>>) =>
			handlePushActivity(action.payload.params.replacementActivity)
	};
}

function* handlePushActivity(activity: Activity): SagaGenerator<void> {
	try {
		const activityLoadingState = ActivitySelectors.loadingState(activity).state;
		if (activityLoadingState === "missing") {
			yield* put(ActivityActions.loadData({ activityId: activity.id }));
		}
	} catch (error) {
		yield* call(ActivityUtils.handleError, activity.id, "loading", error);
	}
}
