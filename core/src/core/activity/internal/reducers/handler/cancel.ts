// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Action } from "typescript-fsa";

import type { ActivityActions } from "../../actions.js";
import type { ActivityMap } from "../../activityMap.js";
import { findDependentActivities } from "../../utils.js";

import { addActivityToActivityMap } from "./push.js";

/** @internal */
export function handleCancel(
	state: ActivityMap,
	{ payload: { activityId, replacementActivity } }: Action<ActivityActions.CancelPayload>
): ActivityMap {
	const dependentActivities = findDependentActivities(state, activityId);

	const activityMap = Object.keys(state)
		.filter(key => dependentActivities[key] === undefined && key !== activityId)
		.reduce((newState, key) => ({ ...newState, [key]: state[key] }), {});

	return replacementActivity !== undefined
		? addActivityToActivityMap(activityMap, replacementActivity)
		: activityMap;
}
