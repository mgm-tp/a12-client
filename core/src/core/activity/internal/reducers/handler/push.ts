// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Action } from "typescript-fsa";

import { ActivityActions } from "../../actions.js";
import { Activity } from "../../activity.js";
import { ActivityMap } from "../../activityMap.js";
import { findLatestActivity } from "../../utils.js";

/** @internal */
export function handlePushAction(
	state: ActivityMap,
	{ payload: { activity } }: Action<ActivityActions.PushPayload>
): ActivityMap {
	return addActivityToActivityMap(state, activity);
}

/** @internal */
export function addActivityToActivityMap(
	activityMap: ActivityMap,
	activity: Activity
): ActivityMap {
	/**
	 * updates the activityIdCounter when using push directly
	 * e.g. when importing state via redux dev tools
	 *
	 * Ensures that new id creation always "starts" from the
	 * current greatest id
	 */
	const id = Number(activity.id);
	if (Number.isInteger(id) && id > ActivityActions.activityIdCounter) {
		ActivityActions.activityIdCounter = id;
	}

	const activationTimestamp = calculateMaximalTimestamp(activityMap, activity.id, Date.now());

	let dataHolders = activity.dataHolders;
	// No default data holder
	if (dataHolders.every(Activity.DataHolder.hasNotDescriptor(activity.descriptor))) {
		dataHolders = [
			...dataHolders,
			{
				...defaultDataHolder,
				descriptor: activity.descriptor,
				slices: {}
			}
		];
	}

	const updatedActivityMap = {
		...activityMap,
		[activity.id]: { ...activity, dataHolders, activationTimestamp }
	};
	return ActivityMap.checkValidity(updatedActivityMap);
}

const defaultDataHolder = {
	data: {},
	loadingState: "without" as const,
	savingState: "saved" as const,
	dirty: false,
	busy: false,
	error: undefined
};

function calculateMaximalTimestamp(
	activities: ActivityMap,
	activityId: string,
	timestamp: number
): number {
	const latestActivity = findLatestActivity(activities);

	if (
		latestActivity === undefined ||
		latestActivity.activationTimestamp === undefined || // TODO: is this case even possible
		latestActivity.activationTimestamp < timestamp ||
		latestActivity.id === activityId
	) {
		return timestamp;
	}

	return latestActivity.activationTimestamp + 1;
}
