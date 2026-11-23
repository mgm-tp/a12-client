// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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

const MobileNavigationCustomModule: DynamicConfiguration = {
	id: "ui_handling.mobile-custom-layout",
	flows: dynamicFlows,
	menus: createMenu
};

export default MobileNavigationCustomModule;
