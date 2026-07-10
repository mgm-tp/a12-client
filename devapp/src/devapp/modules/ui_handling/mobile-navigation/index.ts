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
	ApplicationModel,
	DynamicFlow,
	DynamicMenu
} from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	ApplicationActions,
	MasterDetailRegionLayoutNG,
	NullRegionLayoutNG,
	StackRegionLayoutNG
} from "@com.mgmtp.a12.client/client-core";

import { PersonForm } from "../../../mocks/SimpleForm/forms/person-form.js";
import { PersonOverview } from "../../../mocks/SimpleOverview/overviews/person-overview.js";
import type { SampleAppModule } from "../../../utils/SampleAppModule.js";
import { withProgressIndicator } from "../../../utils/withProgressIndicator.js";

import { createDashboardLayout } from "../dashboardLayoutFactory.js";

import {
	createDashboardView,
	MobileNavigationDashboardSidebar,
	StartDashboard
} from "./components/dashboardLayout.js";
import {
	FormEngineSidebar,
	MobileNavigationOverviewEngineSidebar
} from "./components/masterDetailLayout.js";
import { createNullRegionView, NullRegionSidebar } from "./components/nullRegionLayout.js";
import { StackLayoutView } from "./components/stackLayout.js";
import { createMultipleActivitiesForDashboard } from "./dashboardSaga.js";

const MASTER_DETAIL_DESCRIPTOR = {
	section: "UIHandling",
	feature: "MobileNavigation.MasterDetailLayout",
	model: "Person-document"
};
const DASHBOARD_DESCRIPTOR = {
	section: "UIHandling",
	feature: "DashboardLayout",
	model: "Person-document"
};
const STACK_DESCRIPTOR = { section: "UIHandling", feature: "StackLayout" };
const NULL_REGION_DESCRIPTOR = { section: "UIHandling", feature: "NullRegionLayout" };

// --- Match functions ---

function matchesMasterDetailLayout(d: Activity.Descriptor): boolean {
	return (
		d.section === "UIHandling" &&
		d.feature === "MobileNavigation.MasterDetailLayout" &&
		d.model === "Person-document" &&
		!d.instance
	);
}

function matchesMobileNavigationForm(d: Activity.Descriptor): boolean {
	return d.feature === "MobileNavigation.MasterDetailLayout" && !!d.instance;
}

function matchesInitDashboard(d: Activity.Descriptor): boolean {
	return d.section === "UIHandling" && d.feature === "DashboardLayout" && !d.scene;
}

function matchesDashboardExample(d: Activity.Descriptor): boolean {
	return d.section === "UIHandling" && d.feature === "DashboardLayout" && d.scene === "Dashboard";
}

function matchesTile1(d: Activity.Descriptor): boolean {
	return d.tile === "Tile1" && !d.instance;
}

function matchesTile2(d: Activity.Descriptor): boolean {
	return d.tile === "Tile2" && !d.instance;
}

function matchesCrudOverviewTile(d: Activity.Descriptor): boolean {
	return d.model === "Person-document" && !d.instance;
}

function matchesCrudDetail(d: Activity.Descriptor): boolean {
	return !!d.instance;
}

function matchesStackLayout(d: Activity.Descriptor): boolean {
	return d.section === "UIHandling" && d.feature === "StackLayout";
}

function matchesNullRegionLayout(d: Activity.Descriptor): boolean {
	return d.section === "UIHandling" && d.feature === "NullRegionLayout";
}

const DASHBOARD_ROWS: ApplicationModel.Dashboard.Row[] = [
	{
		columns: [{ width: { sm: 9, md: 8, lg: 8 } }, { width: { sm: 3, md: 4, lg: 4 } }]
	},
	{
		columns: [{ width: { sm: 12, md: 12, lg: 12 } }]
	}
];

const PersonOverviewWithProgress = withProgressIndicator(PersonOverview);
const PersonFormWithProgress = withProgressIndicator(PersonForm);

const dynamicFlows: DynamicFlow[] = [
	{
		name: "MasterDetail",
		scenes: [
			{
				name: "MasterDetailLayout",
				matches: matchesMasterDetailLayout,
				sceneChange: {
					onEnter: [
						{ type: "DYNAMIC_CLEAR_REGION", region: "/SIDEBAR" },
						{
							type: "DYNAMIC_ADD_VIEW",
							component: MobileNavigationOverviewEngineSidebar,
							region: "/SIDEBAR"
						},
						{
							type: "DYNAMIC_ADD_VIEW",
							component: PersonOverviewWithProgress,
							region: "/CONTENT",
							constraints: { type: "MasterDetail" },
							models: [{ modelType: "document", name: "Person-document" }]
						}
					]
				}
			},
			{
				name: "MobileNavigationForm",
				matches: matchesMobileNavigationForm,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: PersonFormWithProgress,
							region: "/CONTENT",
							models: [{ modelType: "document", name: "Person-document" }]
						},
						{
							type: "DYNAMIC_CLEAR_REGION",
							region: "/SIDEBAR",
							layout: NullRegionLayoutNG
						},
						{
							type: "DYNAMIC_ADD_VIEW",
							component: FormEngineSidebar,
							region: "/SIDEBAR"
						}
					]
				}
			}
		]
	},
	{
		name: "DashboardLayout",
		scenes: [
			{
				name: "InitDashboardExample",
				matches: matchesInitDashboard,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: StartDashboard,
							region: "/CONTENT"
						}
					]
				}
			},
			{
				name: "DashboardExample",
				matches: matchesDashboardExample,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_CLEAR_REGION",
							region: "/SIDEBAR",
							layout: NullRegionLayoutNG
						},
						{
							type: "DYNAMIC_CLEAR_REGION",
							region: "/CONTENT",
							layout: createDashboardLayout(DASHBOARD_ROWS)
						}
					]
				}
			},
			{
				name: "Tile1",
				priorScene: "DashboardExample",
				matches: matchesTile1,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: createDashboardView("Tile 1"),
							region: "/CONTENT"
						},
						{
							type: "DYNAMIC_ADD_VIEW",
							component: MobileNavigationDashboardSidebar,
							region: "/SIDEBAR"
						}
					]
				}
			},
			{
				name: "Tile2",
				priorScene: "DashboardExample",
				matches: matchesTile2,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: createDashboardView("Tile 2"),
							region: "/CONTENT"
						}
					]
				}
			},
			{
				name: "CRUDOverviewTitle",
				priorScene: "DashboardExample",
				matches: matchesCrudOverviewTile,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: PersonOverviewWithProgress,
							region: "/CONTENT",
							models: [{ modelType: "document", name: "Person-document" }]
						}
					],
					onExit: [
						{
							type: "DYNAMIC_CLEAR_REGION",
							region: "/CONTENT",
							layout: MasterDetailRegionLayoutNG
						}
					]
				}
			},
			{
				name: "CrudDetail",
				priorScene: "CRUDOverviewTitle",
				matches: matchesCrudDetail,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: PersonFormWithProgress,
							region: "/CONTENT",
							models: [{ modelType: "form", name: "MobileNavigation-form" }]
						}
					]
				}
			}
		]
	},
	{
		name: "StackLayout",
		scenes: [
			{
				name: "StackLayout",
				matches: matchesStackLayout,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_CLEAR_REGION",
							region: "/CONTENT",
							layout: StackRegionLayoutNG
						},
						{
							type: "DYNAMIC_ADD_VIEW",
							component: StackLayoutView,
							region: "/CONTENT"
						}
					]
				}
			}
		]
	},
	{
		name: "NullRegionLayout",
		scenes: [
			{
				name: "NullRegionLayout",
				matches: matchesNullRegionLayout,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_CLEAR_REGION",
							region: "/CONTENT",
							layout: NullRegionLayoutNG
						},
						{
							type: "DYNAMIC_ADD_VIEW",
							component: createNullRegionView("View 1"),
							region: "/CONTENT"
						},
						{
							type: "DYNAMIC_ADD_VIEW",
							component: createNullRegionView("View 2"),
							region: "/CONTENT"
						},
						{
							type: "DYNAMIC_ADD_VIEW",
							component: createNullRegionView("View 3"),
							region: "/CONTENT"
						},
						{
							type: "DYNAMIC_ADD_VIEW",
							component: NullRegionSidebar,
							region: "/SIDEBAR"
						}
					]
				}
			}
		]
	}
];

// --- Menu ---

function onMasterDetailClick(dispatch: Dispatch): void {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: MASTER_DETAIL_DESCRIPTOR,
				loadingState: "without"
			}),
			descriptor: {}
		})
	);
}

function onDashboardClick(dispatch: Dispatch): void {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: DASHBOARD_DESCRIPTOR,
				loadingState: "without"
			}),
			descriptor: {}
		})
	);
}

function onStackClick(dispatch: Dispatch): void {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: STACK_DESCRIPTOR,
				loadingState: "without"
			}),
			descriptor: {}
		})
	);
}

function onNullRegionClick(dispatch: Dispatch): void {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: NULL_REGION_DESCRIPTOR,
				loadingState: "without"
			}),
			descriptor: {}
		})
	);
}

function selectMenus(state: object): DynamicMenu[] {
	const masterDetails = ActivitySelectors.activitiesByDescriptor(MASTER_DETAIL_DESCRIPTOR)(state);
	const dashboards = ActivitySelectors.activitiesByDescriptor(DASHBOARD_DESCRIPTOR)(state);
	const stacks = ActivitySelectors.activitiesByDescriptor(STACK_DESCRIPTOR)(state);
	const nullRegions = ActivitySelectors.activitiesByDescriptor(NULL_REGION_DESCRIPTOR)(state);
	return [
		{
			id: "ui_handling.mobile-navigation.master-detail-layout",
			label: {
				key: "ui_handling.mobile-navigation.master-detail-layout",
				defaults: { en: "Master Detail Layout", de: "Master Detail Layout" }
			},
			action: onMasterDetailClick,
			selected: masterDetails.at(0) !== undefined
		},
		{
			id: "ui_handling.mobile-navigation.dashboard-layout",
			label: {
				key: "ui_handling.mobile-navigation.dashboard-layout",
				defaults: { en: "Dashboard Layout", de: "Dashboard Layout" }
			},
			action: onDashboardClick,
			selected: dashboards.at(0) !== undefined
		},
		{
			id: "ui_handling.mobile-navigation.stack-layout",
			label: {
				key: "ui_handling.mobile-navigation.stack-layout",
				defaults: { en: "Stack Layout", de: "Stack Layout" }
			},
			action: onStackClick,
			selected: stacks.at(0) !== undefined
		},
		{
			id: "ui_handling.mobile-navigation.null-region-layout",
			label: {
				key: "ui_handling.mobile-navigation.null-region-layout",
				defaults: { en: "Null Region Layout", de: "Null Region Layout" }
			},
			action: onNullRegionClick,
			selected: nullRegions.at(0) !== undefined
		}
	];
}

export const MobileNavigationModule: SampleAppModule = {
	id: "ui_handling.mobile-navigation",
	flows: dynamicFlows,
	menus: selectMenus,
	sagas: () => [createMultipleActivitiesForDashboard]
};
