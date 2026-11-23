// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Action, Success } from "typescript-fsa";

import type { ActivityActions } from "../../actions.js";
import { ActivityMap } from "../../activityMap.js";

import { addActivityToActivityMap } from "./push.js";
import { handleSaveStarted } from "./save.js";

/** @internal */
export function handleCommitStarted(
	state: ActivityMap,
	action: Action<ActivityActions.CommitPayload>
): ActivityMap {
	return handleSaveStarted(state, action);
}

/** @internal */
export function handleCommitDone(
	state: ActivityMap,
	{
		payload: {
			params: { activityId, replacementActivity }
		}
	}: Action<Success<ActivityActions.CommitPayload, {}>>
): ActivityMap {
	const activityMap = ActivityMap.applyActivityChange(state, activityId, () => undefined);
	return replacementActivity !== undefined
		? addActivityToActivityMap(activityMap, replacementActivity)
		: activityMap;
}
