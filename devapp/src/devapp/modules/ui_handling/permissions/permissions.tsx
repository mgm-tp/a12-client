// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { actionCreatorFactory } from "typescript-fsa";

import type {
	ActivityActions,
	ActivityReducers,
	DynamicMatchCondition
} from "@com.mgmtp.a12.client/client-core";
import { Activity, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";

export const permissionExampleDescriptor = {
	section: "UIHandling",
	feature: "Permissions"
};

function equal(d1: Activity.Descriptor, d2: Activity.Descriptor): boolean {
	const k1 = Object.keys(d1);
	const k2 = Object.keys(d2);
	return k1.length === k2.length && k1.every(p1 => d1[p1] === d2[p1]);
}

export const isPermissionExampleDescriptor: DynamicMatchCondition = descriptor =>
	equal(descriptor, permissionExampleDescriptor);

interface PermissionsUpdatedPayload extends ActivityActions.ActivityActionPayload {
	readonly permissions: string[];
}

const actionCreator = actionCreatorFactory("PERMISSIONS");
export const permissionsUpdated = actionCreator<PermissionsUpdatedPayload>("PERMISSIONS_UPDATED");

const permissionSlice = "permissions";

export function selectPermissions(state: object): string[] {
	const [activity] = ActivitySelectors.activitiesByDescriptor(permissionExampleDescriptor)(state);
	return (Activity.findDefaultDataHolder(activity)?.slices[permissionSlice] ?? []) as string[];
}

export const permissionReducer: ActivityReducers.DataReducer = {
	reduce(dataHolders, action, defaultDataHolder) {
		return permissionsUpdated.match(action)
			? dataHolders.map(dh =>
					dh === defaultDataHolder
						? {
								...dh,
								slices: {
									...dh.slices,
									[permissionSlice]: action.payload.permissions
								}
							}
						: dh
				)
			: dataHolders;
	}
};
