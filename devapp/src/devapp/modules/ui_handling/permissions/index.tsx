// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";

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
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";
import type { MultiselectProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/multiselect/main/multiselect.api.js";
import { Multiselect } from "@com.mgmtp.a12.widgets/widgets-core/lib/multiselect/main/multiselect.view.js";

import { memoize } from "../../../3rd-party-licenses/memoize.js";

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
		permissions?.some(s => s === i.id) ? { ...i, selected: true } : i
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

const createMemoizedMenu = memoize(
	(selected: boolean, permissions: string[]) => {
		const childMenus: DynamicMenu[] = [
			{
				id: "chooser",
				selected,
				label: {
					key: "examples.ui-handling.permissions.menu.chooser"
				},
				action(dispatch) {
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
			}
		];

		if (permissions.includes("modeler") || permissions.includes("tester")) {
			childMenus.push({
				id: "modeler_tester",
				label: {
					key: "examples.ui-handling.permissions.menu.label",
					args: { permission: { type: "plain", value: "Modeler + Tester" } }
				},
				action(dispatch) {
					dispatch(
						NotificationActions.add({
							title: {
								key: "examples.ui-handling.permissions.menu.action",
								args: { permission: { type: "plain", value: "Modeler + Tester" } }
							},
							severity: "info",
							duration: 2000
						})
					);
				}
			});
		}

		if (permissions.includes("systemAdmin")) {
			childMenus.push({
				id: "systemAdmin",
				label: {
					key: "examples.ui-handling.permissions.menu.label",
					args: { permission: { type: "plain", value: "SystemAdmin" } }
				},
				action(dispatch) {
					dispatch(
						NotificationActions.add({
							title: {
								key: "examples.ui-handling.permissions.menu.action",
								args: { permission: { type: "plain", value: "SystemAdmin" } }
							},
							severity: "info",
							duration: 2000
						})
					);
				}
			});
		}

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
	(s, p) => `${s}.${p.join(".")}`
);

export const PermissionModule: DynamicConfiguration = {
	id: "ui_handling.permissions",
	menus: state => {
		const [activity] = ActivitySelectors.activitiesByDescriptor(permissionExampleDescriptor)(state);
		const isSelected = activity !== undefined;

		const permissions = selectPermissions(state);

		return createMemoizedMenu(isSelected, permissions);
	},
	flows: PERMISSION_FLOWS,
	dataReducers: () => [permissionReducer]
};
