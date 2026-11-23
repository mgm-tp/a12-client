// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import deepEqual from "fast-deep-equal";
import type { Action } from "typescript-fsa";

import type { ActivityActions } from "../../actions.js";
import { Activity } from "../../activity.js";
import { ActivityMap } from "../../activityMap.js";
import { ActivitySelectors } from "../../selectors.js";

/** @internal */
export function handleLoadData(
	state: ActivityMap,
	{
		payload: { activityId, dataHolderDescriptors = [], missingOnly = false }
	}: Action<ActivityActions.LoadDataPayload>
): ActivityMap {
	return ActivityMap.applyActivityChange(state, activityId, activity => {
		const { dataHolders } = activity;
		const busy = Activity.findDefaultDataHolder(activity)?.busy;
		const loadingState = ActivitySelectors.loadingState(activity).state;

		// We don't want to change the store when the whole activity is already busy/loading and
		// it is requested to load all data, because the given list of data holder descriptors is empty.
		// There are use cases when an activity has many data holders and the loadData action gets triggered
		// as soon as one of its data holders has been initialized (e.g. relationships extension)
		if (dataHolderDescriptors.length === 0 && loadingState === "loading" && busy) {
			return activity;
		}

		function isDescriptorRelevant(descriptor: Activity.DataHolderDescriptor): boolean {
			return (
				dataHolderDescriptors.length === 0 ||
				dataHolderDescriptors.some(dhd => deepEqual(dhd, descriptor))
			);
		}

		function isLoadingStateRelevant(dataHolder: Activity.DataHolder): boolean {
			return (
				dataHolder.loadingState === "missing" ||
				(!missingOnly && dataHolder.loadingState !== "without")
			);
		}

		return {
			...activity,
			dataHolders: dataHolders.map(dataHolder => {
				if (isDescriptorRelevant(dataHolder.descriptor) && isLoadingStateRelevant(dataHolder)) {
					return { ...dataHolder, loadingState: "loading", busy: true };
				} else {
					return dataHolder;
				}
			})
		};
	});
}
