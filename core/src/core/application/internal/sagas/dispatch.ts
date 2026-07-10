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
import { select, takeEvery } from "typed-redux-saga";

import type { Action } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";

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
