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

import type { Activity, DynamicFlow, DynamicMenu } from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	ApplicationActions
} from "@com.mgmtp.a12.client/client-core";

import type { SampleAppModule } from "../../../utils/SampleAppModule.js";
import { withProgressIndicator } from "../../../utils/withProgressIndicator.js";

import { FocusHandlingProgressIndicatorDataProvider } from "./dataProvider.js";
import { DescriptionView } from "./description.js";
import { pushFocusHandlingActivity } from "./sagas.js";
import { ViewWithApplicationProgressIndicator } from "./viewWithApplicationProgressIndicator.js";
import { ViewWithOwnProgressIndicator } from "./viewWithOwnProgressIndicator.js";

const INITIAL_DESCRIPTOR = {
	section: "Examples",
	feature: "FocusHandlingProgressIndicator"
};

function matchesDescription(d: Activity.Descriptor): boolean {
	return d.section === "Examples" && d.feature === "FocusHandlingProgressIndicator" && !d.instance;
}

function matchesAppIndicator(d: Activity.Descriptor): boolean {
	return (
		d.section === "Examples" &&
		d.feature === "FocusHandlingProgressIndicator" &&
		d.instance === "viewWithApplicationProgressIndicator"
	);
}

function matchesOwnIndicator(d: Activity.Descriptor): boolean {
	return (
		d.section === "Examples" &&
		d.feature === "FocusHandlingProgressIndicator" &&
		d.instance === "viewWithOwnProgressIndicator"
	);
}

const dynamicFlows: DynamicFlow[] = [
	{
		name: "examples.focus_handling_progress_indicator",
		scenes: [
			{
				name: "FocusHandlingDescription",
				matches: matchesDescription,
				sceneChange: {
					onEnter: [
						{ type: "DYNAMIC_CLEAR_REGION", region: "/CONTENT" },
						{
							type: "DYNAMIC_ADD_VIEW",
							component: DescriptionView,
							region: "/CONTENT"
						}
					]
				}
			},
			{
				name: "FocusHandlingView1",
				matches: matchesAppIndicator,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: withProgressIndicator(ViewWithApplicationProgressIndicator),
							region: "/CONTENT"
						}
					]
				}
			},
			{
				name: "FocusHandlingView2",
				matches: matchesOwnIndicator,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: ViewWithOwnProgressIndicator,
							region: "/CONTENT"
						}
					]
				}
			}
		]
	}
];

function onMenuClick(dispatch: Dispatch): void {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: INITIAL_DESCRIPTOR,
				loadingState: "without"
			}),
			descriptor: {}
		})
	);
}

function selectMenus(state: object): DynamicMenu[] {
	const activities = ActivitySelectors.activitiesByDescriptor(INITIAL_DESCRIPTOR)(state);
	return [
		{
			id: "examples.focus_handling_progress_indicator",
			label: {
				key: "examples.focus_handling_progress_indicator",
				defaults: {
					en: "Progress Indicator Custom Focus Handling",
					de: "Progress Indicator Custom Focus Handling"
				}
			},
			action: onMenuClick,
			selected: activities.at(0) !== undefined
		}
	];
}

export const FocusHandlingProgressIndicatorModule: SampleAppModule = {
	id: "examples.focus_handling_progress_indicator",
	flows: dynamicFlows,
	menus: selectMenus,
	sagas: () => [pushFocusHandlingActivity],
	dataProviders: () => [FocusHandlingProgressIndicatorDataProvider]
};
