// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Activity } from "../../core/activity/index.js";

export interface TestActivityProps extends Partial<Activity> {
	readonly id: string;
	readonly activityDataHolder?: Partial<Activity.DataHolder>;
	readonly dirtyStateOfActivityDataHolder?: boolean;
}

export function createActivity(props: TestActivityProps): Activity {
	const {
		id,
		initiatingActivityId,
		descriptor,
		cancelConfirmationRequired,
		dataHolders,
		activationTimestamp,
		lock,
		activityDataHolder,
		dirtyStateOfActivityDataHolder,
		case: caze
	} = props;

	const activityDescriptor = descriptor ?? { model: "CRUD" };

	const activity: Activity = {
		id,
		descriptor: activityDescriptor,
		activationTimestamp: activationTimestamp ?? 0,
		dataHolders:
			dataHolders === undefined || dataHolders.length === 0
				? [
						createDataHolder({
							descriptor: activityDescriptor,
							dirty: dirtyStateOfActivityDataHolder,
							...activityDataHolder
						})
					]
				: dataHolders,
		initiatingActivityId,
		cancelConfirmationRequired,
		lock,
		case: caze
	};

	return activity;
}

export function createDataHolder<T = {}>(
	options: Partial<Activity.DataHolder<T>> = {}
): Activity.DataHolder<T> {
	const {
		descriptor,
		data,
		datasourceActivityId,
		loadingState,
		savingState,
		dirty,
		busy,
		error,
		slices
	} = options;

	return {
		descriptor: descriptor ?? { model: "CRUD" },
		data: data ?? ({} as T),
		datasourceActivityId,
		loadingState: loadingState ?? "loaded",
		savingState: savingState ?? "not_saved",
		dirty: dirty ?? false,
		busy: busy ?? false,
		error,
		slices: slices ?? {}
	};
}
