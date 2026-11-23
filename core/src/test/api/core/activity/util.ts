// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
