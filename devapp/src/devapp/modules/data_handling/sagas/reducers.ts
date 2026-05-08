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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
