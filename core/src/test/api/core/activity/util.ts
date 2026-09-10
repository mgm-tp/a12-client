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

import type { Activity, ActivityMap } from "../../../../core/activity/index.js";
import { createActivity } from "../../../utils/activity.js";

export function setupActivityMap(activities: Activity[]): ActivityMap {
	return activities.reduce(
		(activityMap, activity) => ({ ...activityMap, [activity.id]: activity }),
		{}
	);
}
export const LIST_MOCK_ACTIVITIES: Activity[] = [
	createActivity({ id: "3", activationTimestamp: 4 }),
	createActivity({
		id: "1",
		activationTimestamp: 1,
		descriptor: { model: "offer", instance: "123" }
	}),
	createActivity({
		id: "1_2",
		activationTimestamp: 38,
		initiatingActivityId: "1",
		descriptor: { model: "offer", page: "details" }
	}),
	createActivity({
		id: "1_2_1",
		activationTimestamp: 2,
		initiatingActivityId: "1_2",
		descriptor: { model: "offer", page: "details" }
	}),
	createActivity({ id: "2", activationTimestamp: 3 }),
	createActivity({
		id: "3_1",
		activationTimestamp: 55,
		initiatingActivityId: "3",
		descriptor: { model: "offer", instance: "4" }
	}),
	createActivity({
		id: "3_2",
		activationTimestamp: 56,
		initiatingActivityId: "3",
		descriptor: { model: "offer", instance: "5" },
		activityDataHolder: { dirty: false }
	}),
	createActivity({
		id: "1_1",
		activationTimestamp: 37,
		initiatingActivityId: "1"
	})
];
