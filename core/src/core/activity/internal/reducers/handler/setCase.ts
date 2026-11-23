// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Action } from "typescript-fsa";

import type { ActivityActions } from "../../actions.js";
import { ActivityMap } from "../../activityMap.js";

/** @internal */
export function handleSetCase(
	state: ActivityMap,
	{ payload: { activityId, case: caze } }: Action<ActivityActions.SetCasePayload>
): ActivityMap {
	return ActivityMap.applyActivityChange(state, activityId, activity =>
		activity.case !== caze ? { ...activity, case: caze } : activity
	);
}
