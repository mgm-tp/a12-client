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
