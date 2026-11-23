// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Activity, ActivityReducers } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions } from "@com.mgmtp.a12.client/client-core";

import {
	addDataHolder,
	dataDeleted,
	logActionType,
	toggleDirty,
	toggleUpdateInstance
} from "./actions.js";
import { EXAMPLE_DESCRIPTOR } from "./descriptor.js";

export const dataReducers: ActivityReducers.DataReducer[] = [
	{
		reduce(dataHolders, action) {
			// delete operation is not an async action, so we manually set the busy state to be able to see the spinner
			return ActivityActions.removeData.match(action)
				? dataHolders.map(dh =>
						action.payload.instanceId === dh.descriptor.id ? { ...dh, busy: true } : dh
					)
				: dataHolders;
		}
	},
	{
		reduce(dataHolders, action) {
			return toggleDirty.match(action)
				? dataHolders.map(dh =>
						action.payload.dataholderIds.includes(dh.descriptor.id ?? "")
							? { ...dh, dirty: !dh.dirty }
							: dh
					)
				: dataHolders;
		}
	},
	{
		reduce(dataHolders, action) {
			return dataDeleted.match(action)
				? dataHolders.filter(dh => !action.payload.dataholderIds.includes(dh.descriptor.id ?? ""))
				: dataHolders;
		}
	},
	{
		reduce(dataHolders, action) {
			return toggleUpdateInstance.match(action)
				? dataHolders.map(dh =>
						dh.descriptor.id === "0"
							? { ...dh, slices: { ...dh.slices, updateInstance: !dh.slices.updateInstance } }
							: dh
					)
				: dataHolders;
		}
	},
	{
		reduce(dataHolders, action, defaultDh) {
			return logActionType.match(action)
				? dataHolders.map(dh =>
						dh === defaultDh
							? {
									...dh,
									slices: {
										...dh.slices,
										log: ((dh.slices.log as string[]) ?? []).concat(action.payload.type)
									}
								}
							: dh
					)
				: dataHolders;
		}
	},
	{
		reduce(dataHolders, action) {
			const latestDhId =
				dataHolders
					.map(dh => parseInt(dh.descriptor.id ?? "", 10))
					.toSorted((a, b) => a - b)
					.at(-1) ?? 0;
			const nextId = latestDhId + 1;

			return addDataHolder.match(action)
				? dataHolders.concat(createDataHolder(nextId))
				: dataHolders;
		}
	}
];

export function createDataHolder(id: number): Activity.DataHolder {
	return {
		descriptor: {
			...EXAMPLE_DESCRIPTOR,
			id: id.toString()
		},
		data: {},
		dirty: false,
		busy: false,
		loadingState: "missing",
		savingState: "not_saved",
		slices: {}
	};
}
