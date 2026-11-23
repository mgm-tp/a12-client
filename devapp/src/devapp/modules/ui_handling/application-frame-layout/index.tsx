// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Dispatch } from "redux";

import type {
	Activity,
	DynamicConfiguration,
	DynamicFlow,
	DynamicMenu,
	ApplicationFrameLayoutPropsNG
} from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	ApplicationActions
} from "@com.mgmtp.a12.client/client-core";

import { PersonForm } from "../../../mocks/SimpleForm/forms/person-form.js";
import { PersonOverview } from "../../../mocks/SimpleOverview/overviews/person-overview.js";
import { DevappApplicationFrameLayout } from "../../../NewLayoutsModule.js";

import { CustomExtendedSidebar } from "./customExtendedSidebar.js";

function CustomApplicationFrameLayout(props: ApplicationFrameLayoutPropsNG) {
	return (
		<DevappApplicationFrameLayout
			{...props}
			disableCollapsingSub
			subExpanded={false}
			subExpandedState={"minimized"}
		/>
	);
}

const customAppFrameDescriptor = {
	section: "UIHandling",
	feature: "ApplicationFrameLayout",
	model: "Person-document"
};

function createMenu(state: object): DynamicMenu[] {
	const [activity] = ActivitySelectors.activitiesByDescriptor(customAppFrameDescriptor)(state);
	return [
		{
			id: "ui_handling.application-frame-layout",
			label: { key: "examples.ui-handling.customAppFrame.menuLabel" },
			action: onMenuClick,
			selected: activity !== undefined
		}
	];
}

function onMenuClick(dispatch: Dispatch) {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: customAppFrameDescriptor,
				loadingState: "missing"
			}),
			descriptor: {}
		})
	);
}

const dynamicFlows: DynamicFlow[] = [
	{
		name: "ui_handling.application-frame-layout",
		scenes: [
			{
				name: "application-frame-layout-overview",
				matches: matchesOverview,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_CLEAR_REGION",
							region: "",
							layout: {
								component: CustomApplicationFrameLayout
							}
						},
						{
							type: "DYNAMIC_ADD_VIEW",
							component: CustomExtendedSidebar,
							region: "/SIDEBAR"
						},
						{
							type: "DYNAMIC_ADD_VIEW",
							component: PersonOverview,
							region: "/CONTENT",
							models: [
								{
									modelType: "document",
									name: "Person-document"
								}
							]
						}
					]
				}
			},
			{
				name: "application-frame-layout-form",
				priorScene: "application-frame-layout-overview",
				matches: matchesForm,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							region: "/CONTENT",
							component: PersonForm,
							models: [
								{
									modelType: "document",
									name: "Person-document"
								}
							]
						}
					]
				}
			}
		]
	}
];

function matchesOverview(descriptor: Activity.Descriptor) {
	return (
		descriptor.section === "UIHandling" &&
		descriptor.feature === "ApplicationFrameLayout" &&
		!descriptor.instance
	);
}

function matchesForm(descriptor: Activity.Descriptor) {
	return !!descriptor.instance;
}

const ApplicationFrameLayoutModule: DynamicConfiguration = {
	id: "ui_handling.application-frame-layout",
	flows: dynamicFlows,
	menus: createMenu
};

export default ApplicationFrameLayoutModule;
