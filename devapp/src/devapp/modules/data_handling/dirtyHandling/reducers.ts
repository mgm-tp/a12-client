// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Action } from "typescript-fsa";

import type { Activity, ActivityReducers } from "@com.mgmtp.a12.client/client-core";

import type { SetDirtyPayload } from "./dirtyHandlingFeatureActions.js";
import { initializeDataHolders, setDirty } from "./dirtyHandlingFeatureActions.js";

export const dataReducers: ActivityReducers.DataReducer[] = [
	{
		reduce(dataHolders, action) {
			return setDirty.match(action) ? dataHolders.map(handleSetDirty(action)) : dataHolders;
		}
	},
	{
		reduce(dataHolders, action) {
			return initializeDataHolders.match(action)
				? dataHolders.concat(
						action.payload.instances.map(instance => ({
							descriptor: { instance, feature: "DirtyHandlingFeature" },
							data: {},
							dirty: false,
							loadingState: "missing",
							savingState: "not_saved",
							slices: {}
						}))
					)
				: dataHolders;
		}
	}
];

function handleSetDirty(
	action: Action<SetDirtyPayload>
): (dh: Activity.DataHolder) => Activity.DataHolder {
	return dh =>
		dh.descriptor.feature === "DirtyHandlingFeature" && dh.descriptor.instance !== undefined
			? {
					...dh,
					loadingState: "loaded",
					dirty: action.payload.dirty
				}
			: dh;
}
