// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Action } from "typescript-fsa";

import type { ActivityActions } from "../../actions.js";
import { ActivityMap } from "../../activityMap.js";

import { applyDataHolderChange } from "../utils.js";

/** @internal */
export function handleSetDataByDescriptor(
	state: ActivityMap,
	{ payload: { activityId, data, descriptor } }: Action<ActivityActions.SetDataByDescriptorPayload>
): ActivityMap {
	return ActivityMap.applyActivityChange(state, activityId, activity => {
		const dataHolders = activity.dataHolders;
		const nextDataHolders = applyDataHolderChange(dataHolders, descriptor, dataHolder => ({
			...dataHolder,
			data: {
				...(dataHolder.data || {}),
				...data
			},
			loadingState: "loaded",
			busy: false
		}));
		return dataHolders !== nextDataHolders
			? { ...activity, dataHolders: nextDataHolders }
			: activity;
	});
}
