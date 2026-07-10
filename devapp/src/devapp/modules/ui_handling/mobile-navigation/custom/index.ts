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

import type { Dispatch } from "redux";

import type {
	Activity,
	DynamicConfiguration,
	DynamicFlow,
	DynamicMenu
} from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	ApplicationActions
} from "@com.mgmtp.a12.client/client-core";

import {
	CustomDetailView,
	CustomLayoutSidebar,
	CustomLayoutView
} from "../components/customLayouts.js";

import { CustomApplicationFrame } from "./CustomApplicationFrame.js";
import { CustomLayout } from "./CustomLayout.js";

const CUSTOM_LAYOUT_DESCRIPTOR = {
	section: "UIHandling",
	feature: "CustomMobileLayout"
};

function createMenu(state: object): DynamicMenu[] {
	return [
		{
			id: "ui_handling.mobile-custom-layout",
			label: { key: "examples.ui-handling.customLayout.menuLabel" },
			selected:
				ActivitySelectors.activitiesByDescriptor(CUSTOM_LAYOUT_DESCRIPTOR)(state).length > 0,
			action: onMenuClick
		}
	];
}

function onMenuClick(dispatch: Dispatch) {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: CUSTOM_LAYOUT_DESCRIPTOR,
				loadingState: "without"
			}),
			descriptor: {}
		})
	);
}

const dynamicFlows: DynamicFlow[] = [
	{
		name: "CustomLayout",
		scenes: [
			{
				name: "CustomLayout",
				matches: matchesOverview,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_CLEAR_REGION",
							region: "",
							layout: {
								component: CustomApplicationFrame
							}
						},
						{
							type: "DYNAMIC_CLEAR_REGION",
							region: "/CONTENT",
							layout: {
								component: CustomLayout
							}
						},
						{
							type: "DYNAMIC_ADD_VIEW",
							region: "/CONTENT",
							component: CustomLayoutView,
							constraints: {
								title: "View 1"
							}
						},
						{
							type: "DYNAMIC_ADD_VIEW",
							component: CustomLayoutSidebar,
							region: "/SIDEBAR"
						}
					]
				}
			},
			{
				name: "CustomDetailView",
				matches: matchesDetailView,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: CustomDetailView,
							region: "/CONTENT"
						}
					]
				}
			}
		]
	}
];

function matchesOverview(descriptor: Activity.Descriptor) {
	return (
		descriptor.section === CUSTOM_LAYOUT_DESCRIPTOR.section &&
		descriptor.feature === CUSTOM_LAYOUT_DESCRIPTOR.feature
	);
}

function matchesDetailView(descriptor: Activity.Descriptor) {
	return descriptor.section === "UIHandling" && descriptor.feature === "CustomDetailView";
}

export const MobileNavigationCustomModule: DynamicConfiguration = {
	id: "ui_handling.mobile-custom-layout",
	flows: dynamicFlows,
	menus: createMenu
};
