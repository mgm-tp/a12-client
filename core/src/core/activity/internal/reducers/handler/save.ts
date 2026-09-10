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
import type { Action, Success } from "typescript-fsa";

import type { ActivityActions } from "../../actions.js";
import { ActivityMap } from "../../activityMap.js";

/** @internal */
export function handleSaveStarted(
	state: ActivityMap,
	{ payload: { activityId, dataHolderDescriptors } }: Action<ActivityActions.SaveDataPayload>
): ActivityMap {
	return ActivityMap.applyActivityChange(state, activityId, activity => {
		const dataHolders = activity.dataHolders;

		const nextDataHolders = dataHolders.map(dataHolder => {
			const isDescriptorRelevant =
				dataHolderDescriptors?.some(dhd => deepEqual(dataHolder.descriptor, dhd)) ||
				(dataHolderDescriptors === undefined &&
					deepEqual(dataHolder.descriptor, activity.descriptor));

			const areStatesRelevant =
				dataHolder.loadingState === "loaded" &&
				!(dataHolder.savingState === "saving" && dataHolder.busy);

			if (isDescriptorRelevant && areStatesRelevant) {
				return {
					...dataHolder,
					savingState: "saving" as const,
					busy: true
				};
			}
			return dataHolder;
		});

		return { ...activity, dataHolders: nextDataHolders };
	});
}

/** @internal */
export function handleSaveDone(
	state: ActivityMap,
	{
		payload: {
			params: { activityId, dataHolderDescriptors },
			result: { instance }
		}
	}: Action<Success<ActivityActions.SaveDataPayload, ActivityActions.SaveResult>>
): ActivityMap {
	return ActivityMap.applyActivityChange(state, activityId, activity => {
		const dataHolders = activity.dataHolders;

		const shouldActivityDescriptorChange =
			dataHolderDescriptors === undefined ||
			dataHolderDescriptors.find(dhd => deepEqual(activity.descriptor, dhd)) !== undefined;

		const newActivityDescriptor =
			instance !== undefined && shouldActivityDescriptorChange
				? { ...activity.descriptor, instance }
				: activity.descriptor;

		let anyDataHolderChanged = false;
		const nextDataHolders = dataHolders.map(dataHolder => {
			const isDefaultDH = deepEqual(dataHolder.descriptor, activity.descriptor);

			const isDescriptorRelevant =
				dataHolderDescriptors?.some(dhd => deepEqual(dataHolder.descriptor, dhd)) ||
				(dataHolderDescriptors === undefined && isDefaultDH);

			const isStateOrInstanceRelevant =
				(isDefaultDH && dataHolder.descriptor.instance !== instance) ||
				dataHolder.savingState !== "saved";

			if (isDescriptorRelevant && isStateOrInstanceRelevant) {
				anyDataHolderChanged = true;

				return {
					...dataHolder,
					...(isDefaultDH ? { descriptor: newActivityDescriptor } : {}),
					savingState: "saved" as const,
					busy: false,
					dirty: false
				};
			}
			return dataHolder;
		});
		return anyDataHolderChanged
			? { ...activity, descriptor: newActivityDescriptor, dataHolders: nextDataHolders }
			: activity;
	});
}
