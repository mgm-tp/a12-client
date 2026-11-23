// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ActivityActions } from "../actions.js";
import { Activity } from "../activity.js";
import { ActivityMap } from "../activityMap.js";

/** @internal */
export function ensureActivityError(error: unknown): Activity.Error {
	return Activity.Error.isInstance(error)
		? error
		: {
				errorCode: "INTERNAL_CLIENT_ERROR",
				message: error
					? error instanceof Error
						? error.message
						: typeof error === "string"
							? error
							: JSON.stringify(error)
					: "Error is null or undefined"
			};
}

interface DataChangeConfig {
	activities: ActivityMap;
	activityId: string;
	dataHolder: Activity.DataHolder;
	action: ActivityActions.DataReducerAction;
	change(
		dataHolder: Activity.DataHolder,
		action: ActivityActions.DataReducerAction
	): Activity.DataHolder;
}

/** @internal */
export function applyDataChange({
	activities,
	activityId,
	action,
	dataHolder,
	change
}: DataChangeConfig): ActivityMap {
	return ActivityMap.applyActivityChange(activities, activityId, activity => {
		const dataHolders = activity.dataHolders;
		const nextDataHolders = applyDataHolderChange(dataHolders, dataHolder.descriptor, () =>
			change(dataHolder, action)
		);
		return dataHolders !== nextDataHolders
			? { ...activity, dataHolders: nextDataHolders }
			: activity;
	});
}

/** @internal */
export function applyDataHolderChange(
	dataHolders: Activity.DataHolder[],
	dataHolderDescriptor: Activity.DataHolderDescriptor,
	change: (dataHolder: Activity.DataHolder) => Activity.DataHolder
): Activity.DataHolder[] {
	const dataHolderIndex = dataHolders.findIndex(
		Activity.DataHolder.hasDescriptor(dataHolderDescriptor)
	);
	if (dataHolderIndex < 0) {
		throw new Error(
			`No data holder found for the given descriptor ${JSON.stringify(
				dataHolderDescriptor,
				null,
				2
			)}`
		);
	}

	const nextDataHolder = change(dataHolders[dataHolderIndex]);
	if (nextDataHolder === dataHolders[dataHolderIndex]) {
		return dataHolders;
	}

	return [
		...dataHolders.slice(0, dataHolderIndex),
		nextDataHolder,
		...dataHolders.slice(dataHolderIndex + 1)
	];
}
