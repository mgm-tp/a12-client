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

import type { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Dispatch } from "redux";

import type {
	DynamicConfiguration,
	DynamicFlow,
	DynamicMenu,
	ViewNGProps
} from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	ApplicationActions,
	NotificationActions
} from "@com.mgmtp.a12.client/client-core";
import {
	ActionContentbox,
	ContentBoxElements,
	type MultiselectProps,
	Multiselect
} from "@com.mgmtp.a12.widgets/widgets-core";

import {
	isPermissionExampleDescriptor,
	permissionExampleDescriptor,
	permissionReducer,
	permissionsUpdated,
	selectPermissions
} from "./permissions.js";

const ALL_ITEMS: MultiselectProps.Item[] = [
	{ id: "modeler", label: "Modeler" },
	{ id: "tester", label: "Tester" },
	{ id: "systemAdmin", label: "SystemAdmin" },
	{ id: "topSecret", label: "TopSecret" }
];

function Chooser(props: ViewNGProps): JSX.Element {
	const dispatch = useDispatch();

	const permissions = useSelector(
		selectPermissions,
		(a, b) => a.length === b.length && a.every((p, i) => p === b[i])
	);

	const items = ALL_ITEMS.map(i =>
		permissions.some(s => s === i.id) ? { ...i, selected: true } : i
	);

	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title text="Permission Chooser" ariaLevel={props.ariaLevel} />
			}
		>
			<p>
				You can choose the roles of the current user with the following multiselect. This should
				affect the visibility of menu entries in the same submenu. The role &quot;TopSecret&quot; is
				not connected to any menu entry.
			</p>
			<Multiselect
				items={items}
				onChange={selected =>
					dispatch(
						permissionsUpdated({
							activityId: props.activityId,
							permissions: selected.map(i => i.id)
						})
					)
				}
				selectAllText="All"
			/>
		</ActionContentbox>
	);
}

const PERMISSION_FLOWS: DynamicFlow[] = [
	{
		name: "ui_handling.permissions",
		scenes: [
			{
				name: "Permissions.Chooser",
				matches: isPermissionExampleDescriptor,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: Chooser,
							region: "/CONTENT"
						}
					]
				}
			}
		]
	}
];

function startChooserActivity(dispatch: Dispatch): void {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: permissionExampleDescriptor,
				loadingState: "without"
			}),
			descriptor: {}
		})
	);
}

function notifyPermissionAction(permission: string): (dispatch: Dispatch) => void {
	return function notifyPermission(dispatch: Dispatch): void {
		dispatch(
			NotificationActions.add({
				title: {
					key: "examples.ui-handling.permissions.menu.action",
					args: { permission: { type: "plain", value: permission } }
				},
				severity: "info",
				duration: 2000
			})
		);
	};
}

const MODELER_TESTER_MENU: DynamicMenu = {
	id: "modeler_tester",
	label: {
		key: "examples.ui-handling.permissions.menu.label",
		args: { permission: { type: "plain", value: "Modeler + Tester" } }
	},
	action: notifyPermissionAction("Modeler + Tester")
};

const SYSTEM_ADMIN_MENU: DynamicMenu = {
	id: "systemAdmin",
	label: {
		key: "examples.ui-handling.permissions.menu.label",
		args: { permission: { type: "plain", value: "SystemAdmin" } }
	},
	action: notifyPermissionAction("SystemAdmin")
};

export const PermissionModule: DynamicConfiguration = {
	id: "ui_handling.permissions",
	menus: state => {
		const activity = ActivitySelectors.activitiesByDescriptor(permissionExampleDescriptor)(
			state
		).at(0);
		const isSelected = activity !== undefined;

		const permissions = selectPermissions(state);

		const childMenus: DynamicMenu[] = [
			{
				id: "chooser",
				selected: isSelected,
				label: {
					key: "examples.ui-handling.permissions.menu.chooser"
				},
				action: startChooserActivity
			},
			...(permissions.includes("modeler") || permissions.includes("tester")
				? [MODELER_TESTER_MENU]
				: []),
			...(permissions.includes("systemAdmin") ? [SYSTEM_ADMIN_MENU] : [])
		];

		return [
			{
				id: "ui_handling.permissions.dynamicMenu",
				label: {
					key: "examples.ui-handling.permissions.menu.entry"
				},
				children: childMenus
			}
		];
	},
	flows: PERMISSION_FLOWS,
	dataReducers: () => [permissionReducer]
};
