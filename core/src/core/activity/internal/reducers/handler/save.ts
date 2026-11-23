// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
