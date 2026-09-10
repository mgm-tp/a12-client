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
