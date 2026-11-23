// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Activity } from "./activity.js";
import { ActivityMap } from "./activityMap.js";

/** @internal */
export function findLatestActivity(activities: ActivityMap): Activity | undefined {
	if (Object.keys(activities).length === 0) {
		return undefined;
	}

	return ActivityMap.toList(activities).reduce((l, e) =>
		e.activationTimestamp > l.activationTimestamp ? e : l
	);
}

/** @internal */
export function findDependentActivities(
	activities: ActivityMap,
	parentActivityId: string
): ActivityMap {
	const parent = activities[parentActivityId];
	return parent !== undefined
		? filter(activities, activity => isRelated(activities, parent, activity))
		: {};
}

function isRelated(activities: ActivityMap, parent: Activity, activity: Activity): boolean {
	let initiatingActivityId = activity.initiatingActivityId;
	while (initiatingActivityId) {
		if (initiatingActivityId === parent.id) {
			return true;
		}

		const directParent = activities[initiatingActivityId];
		initiatingActivityId =
			directParent !== undefined ? directParent.initiatingActivityId : undefined;
	}

	return false;
}

/** @internal */
export function findTopLevelActivities(activities: ActivityMap): ActivityMap {
	return filter(activities, activity => !activity.initiatingActivityId);
}

function filter(activities: ActivityMap, predicate: (activity: Activity) => boolean): ActivityMap {
	return ActivityMap.toList(activities).reduce(
		(activityMap, activity) =>
			predicate(activity) ? { ...activityMap, [activity.id]: activity } : activityMap,
		{}
	);
}
