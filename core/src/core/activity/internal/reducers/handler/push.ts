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
