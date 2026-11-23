// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Action } from "typescript-fsa";

import type { ActivityActions } from "../../actions.js";
import { Activity } from "../../activity.js";
import { ActivityMap } from "../../activityMap.js";

/** @internal */
export function handleSetDirty(
	state: ActivityMap,
	{ payload: { activityId, dirty } }: Action<ActivityActions.SetDirtyPayload>
): ActivityMap {
	return ActivityMap.applyActivityChange(state, activityId, activity => {
		const { dataHolders } = activity;
		const foundDataHolder = dataHolders.find(
			Activity.DataHolder.hasDescriptor(activity.descriptor)
		);
		if (foundDataHolder === undefined) {
			throw new Error(`No dataholder found for activity ${JSON.stringify(activity.descriptor)}`);
		}

		if (foundDataHolder.dirty === dirty) {
			return activity;
		}

		return {
			...activity,
			dataHolders: dataHolders.map(dh => (dh === foundDataHolder ? { ...dh, dirty } : dh))
		};
	});
}
