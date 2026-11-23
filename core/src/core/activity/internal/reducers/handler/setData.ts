// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Action } from "typescript-fsa";

import type { ActivityActions } from "../../actions.js";
import { Activity } from "../../activity.js";
import { ActivityMap } from "../../activityMap.js";

import { applyDataHolderChange } from "../utils.js";

/** @internal */
export function handleSetData(
	state: ActivityMap,
	{
		payload: { activityId, data: payloadData, datasourceActivityId, dirty }
	}: Action<ActivityActions.SetDataPayload>
): ActivityMap {
	return ActivityMap.applyActivityChange(state, activityId, activity => {
		const dataHolders = activity.dataHolders;

		const activityDatasourceActivityId =
			Activity.findDefaultDataHolder(activity)?.datasourceActivityId;

		const nextDataHolders = applyDataHolderChange(dataHolders, activity.descriptor, dataHolder => ({
			...dataHolder,
			data: {
				...(dataHolder.data ?? {}),
				...payloadData
			},
			loadingState: "loaded",
			busy: false,
			dirty: dirty ?? dataHolder.dirty,
			// FIXME: we use the activity's datasourceActivityId here by intention
			// to be backwards compatible
			datasourceActivityId: datasourceActivityId || activityDatasourceActivityId
		}));
		return dataHolders !== nextDataHolders
			? { ...activity, dataHolders: nextDataHolders }
			: activity;
	});
}
