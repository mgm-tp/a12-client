// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Activity, ActivityMap } from "../../../../core/activity/index.js";
import { ActivitySelectors } from "../../../../core/activity/index.js";
import { setupActivityMap } from "../../../api/core/activity/util.js";
import { createActivity } from "../../../utils/activity.js";

export const selectActivities = (activities: ActivityMap) =>
	ActivitySelectors.activities()({ activities });

export const selectActivity = (activities: ActivityMap) => (activityId: string) =>
	ActivitySelectors.activityById(activityId)({ activities });

export function setupState(activityMocks?: Activity[]): ActivityMap {
	if (activityMocks === undefined) {
		return setupActivityMap([createActivity({ id: "1" })]);
	} else {
		return setupActivityMap(activityMocks);
	}
}
