// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { AnyAction, Reducer } from "redux";

import { NotificationActions } from "./actions.js";
import type { Notification } from "./notification.js";

// TODO: use uuid?
let id = 0;

/**
 * All notification related reducers.
 */
export namespace NotificationReducers {
	/**
	 * Reduces notification related actions.
	 */
	export const notifications: Reducer = (state: Notification[] = [], action: AnyAction) => {
		if (NotificationActions.add.match(action)) {
			return [...state, { ...action.payload, id: `${id++}` }];
		} else if (NotificationActions.remove.match(action)) {
			const newState = state.filter(notification =>
				action.payload.every(id => notification.id !== id)
			);
			if (newState.length !== state.length) {
				return newState;
			}
		} else if (NotificationActions.removeByActivityIds.match(action)) {
			const newState = state.filter(notification =>
				action.payload.every(activityId => notification.activityId !== activityId)
			);
			if (newState.length !== state.length) {
				return newState;
			}
		}

		return state;
	};
}
