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

import { DevappApplicationFrameLayout } from "../../../NewLayoutsModule.js";
import { PersonForm } from "../../../mocks/SimpleForm/forms/person-form.js";
import { PersonOverview } from "../../../mocks/SimpleOverview/overviews/person-overview.js";

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
