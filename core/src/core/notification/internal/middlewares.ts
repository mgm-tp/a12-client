// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Middleware } from "redux";

import { ActivityActions, ActivityMap, ActivitySelectors } from "../../activity/index.js";
import { findDependentActivities } from "../../activity/internal/utils.js";
import { StoreFactories } from "../../store/index.js";

import { NotificationActions } from "./actions.js";

/** @internal */
export const removeNotificationsByActivityCloseMiddleware = StoreFactories.createMiddleware(
	(api, next, action) => {
		let activityId: string;
		if (ActivityActions.commit.done.match(action)) {
			activityId = action.payload.params.activityId;
		} else if (ActivityActions.cancel.match(action)) {
			activityId = action.payload.activityId;
		} else {
			return next(action);
		}

		// This needs to be done before next so that the activities are still in the state
		const activities = ActivitySelectors.activities()(api.getState());
		const result = next(action);

		const dependentActivityIds = ActivityMap.toList(
			findDependentActivities(activities, activityId)
		).map(x => x.id);

		api.dispatch(NotificationActions.removeByActivityIds([activityId, ...dependentActivityIds]));

		return result;
	}
);

export const NotificationMiddlewares: Middleware[] = [removeNotificationsByActivityCloseMiddleware];
