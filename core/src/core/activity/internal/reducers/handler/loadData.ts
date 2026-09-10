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
