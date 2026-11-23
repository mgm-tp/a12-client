// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Action } from "typescript-fsa";

import { ActivityMap } from "../../internal/activityMap.js";
import { applyDataHolderChange } from "../../internal/reducers/utils.js";

import type { SetThumbnailsPayload } from "./action.js";
import { updateThumbnailSlice } from "./slice.js";

/** @internal */
export function handleSetThumbnails(
	state: ActivityMap,
	{ payload: { activityId, thumbnails } }: Action<SetThumbnailsPayload>
): ActivityMap {
	return ActivityMap.applyActivityChange(state, activityId, activity => {
		const dataHolders = activity.dataHolders;

		const nextDataHolders = applyDataHolderChange(
			dataHolders,
			activity.descriptor,
			updateThumbnailSlice(thumbnails)
		);
		return dataHolders !== nextDataHolders
			? { ...activity, dataHolders: nextDataHolders }
			: activity;
	});
}
