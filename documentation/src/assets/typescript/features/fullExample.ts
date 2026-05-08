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

// tag::full[]
import type { Reducer } from "redux";
import type { Action } from "typescript-fsa";
import { actionCreatorFactory } from "typescript-fsa";

import type { Modifier, Notification } from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivityLenses,
	type Activity,
	modifyIfPresent,
	modifyWithLens,
	NotificationLenses
} from "@com.mgmtp.a12.client/client-core";
// a custom action to update a notification's duration
export const updateNotificationDuration = actionCreatorFactory()<{
	readonly id: string;
	readonly duration: number;
}>("UPDATE_NOTIFICATION_DURATION");

export const rootReducerExample: (defaultReducer: Reducer<object>) => Reducer<object> =
	defaultReducer => (state, action) => {
		return updateNotificationDuration.match(action) && state
			? handleNotificationUpdate(state, action.payload)
			: ActivityActions.push.match(action) && state
				? handlePush(state, action, defaultReducer)
				: defaultReducer(state, action);
	};

const updateDuration =
	(duration: number): Modifier<Notification> =>
	n => ({ ...n, duration });

// Use NotificationLenses to update the duration of an existing notification
function handleNotificationUpdate(
	state: object,
	payload: { id: string; duration: number }
): object {
	const notificationLens = NotificationLenses.notificationById(payload.id);

	const updateIfNotificationPresent = modifyIfPresent(updateDuration(payload.duration));

	return modifyWithLens(notificationLens)(updateIfNotificationPresent)(state);
}

const updateDescriptor: Modifier<Activity> = a => ({
	...a,
	descriptor: {
		...a.descriptor,
		hasChild: "yes"
	}
});

// Use ActivityLenses to update an activity after another activity was pushed
function handlePush(
	state: object,
	action: Action<ActivityActions.PushPayload>,
	defaultReducer: Reducer<object>
): object {
	// first let the default reducer handle the action
	const nextState = defaultReducer(state, action);

	const parentActivityId = action.payload.activity.initiatingActivityId ?? "";

	// then use lenses to update the state some more
	const updateIfActivityPresent = modifyIfPresent(updateDescriptor);
	return modifyWithLens(ActivityLenses.activity(parentActivityId))(updateIfActivityPresent)(
		nextState
	);
}
// end::full[]
