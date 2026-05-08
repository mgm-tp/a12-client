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
