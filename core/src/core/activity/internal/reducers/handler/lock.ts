// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Action } from "typescript-fsa";

import type { ActivityActions } from "../../actions.js";
import { ActivityMap } from "../../activityMap.js";

/** @internal */
export function handleLock(
	state: ActivityMap,
	{ payload: { activityId, id, owner, details } }: Action<ActivityActions.LockPayload>
): ActivityMap {
	const activity = state[activityId];

	if (activity !== undefined && activity.lock !== undefined) {
		return state;
	}

	return ActivityMap.applyActivityChange(state, activityId, lockedActivity => ({
		...lockedActivity,
		lock: { id, owner, details }
	}));
}
