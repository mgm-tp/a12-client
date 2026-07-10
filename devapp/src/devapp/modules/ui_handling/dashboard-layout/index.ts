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
	MasterDetailRegionLayoutNG
} from "@com.mgmtp.a12.client/client-core";

import { OfferForm } from "../../../mocks/SimpleForm/forms/offer-form.js";
import { PersonForm } from "../../../mocks/SimpleForm/forms/person-form.js";
import { OfferOverview } from "../../../mocks/SimpleOverview/overviews/offer-overview.js";
import { PersonOverview } from "../../../mocks/SimpleOverview/overviews/person-overview.js";
import type { SampleAppModule } from "../../../utils/SampleAppModule.js";
import { withProgressIndicator } from "../../../utils/withProgressIndicator.js";

import { createDashboardLayout } from "../dashboardLayoutFactory.js";

import { articleDataLoader } from "./articleDataLoader.js";
import { createMultipleActivitiesForDashboard } from "./dashboardSaga.js";
import {
	DashboardArticleTile,
	DashboardCalendarTile,
	DashboardIntroTile,
	DashboardMessagesTile,
	DashboardNotesTile,
	DashboardTasksTile,
	MultipleActivitiesDashboardIntroTile
} from "./dashboardViews.js";

const SINGLE_ACTIVITY_DESCRIPTOR = { section: "UIHandling", feature: "DashboardSingleActivity" };
const MULTIPLE_ACTIVITIES_DESCRIPTOR = {
	section: "UIHandling",
	feature: "DashboardMultipleActivities"
};

function matchesSingleActivity(descriptor: Activity.Descriptor): boolean {
	return descriptor.section === "UIHandling" && descriptor.feature === "DashboardSingleActivity";
}

function matchesMultipleActivities(descriptor: Activity.Descriptor): boolean {
	return (
		descriptor.section === "UIHandling" && descriptor.feature === "DashboardMultipleActivities"
	);
}

function matchesIntroTile(descriptor: Activity.Descriptor): boolean {
	return descriptor.tile === "MultipleActivitiesDashboardIntroTile" && !descriptor.instance;
}

function matchesArticleTile(descriptor: Activity.Descriptor): boolean {
	return descriptor.tile === "DashboardArticleTile" && !descriptor.instance;
}

function matchesOverviewCrud(descriptor: Activity.Descriptor): boolean {
	return descriptor.model === "Person-document" && !descriptor.instance;
}

function matchesOverviewOffer(descriptor: Activity.Descriptor): boolean {
	return descriptor.model === "Offer-document" && !descriptor.instance;
}

function matchesCrudDetail(descriptor: Activity.Descriptor): boolean {
	return !!descriptor.instance;
}

function matchesOfferDetail(descriptor: Activity.Descriptor): boolean {
	return !!descriptor.instance;
}

const SINGLE_ACTIVITY_ROWS: ApplicationModel.Dashboard.Row[] = [
	{
		columns: [
			{ width: { sm: 9, md: 8, lg: 9 } },
			{
				width: { sm: 3, md: 4, lg: 3 },
				rows: [
					{ columns: [{ width: { sm: 12, md: 12, lg: 12 } }] },
					{ columns: [{ width: { sm: 12, md: 12, lg: 12 } }] }
				]
			}
		]
	},
	{
		columns: [{ width: { sm: 12, md: 4, lg: 4 } }, { width: { sm: 12, md: 8, lg: 8 } }]
	}
];

const MULTIPLE_ACTIVITIES_ROWS: ApplicationModel.Dashboard.Row[] = [
	{
		columns: [{ width: { sm: 9, md: 8, lg: 8 } }, { width: { sm: 3, md: 4, lg: 4 } }]
	},
	{
		columns: [{ width: { sm: 6, md: 6, lg: 6 } }, { width: { sm: 6, md: 6, lg: 6 } }]
	}
];

const PersonOverviewWithProgress = withProgressIndicator(PersonOverview);
const OfferOverviewWithProgress = withProgressIndicator(OfferOverview);
const PersonFormWithProgress = withProgressIndicator(PersonForm);
const OfferFormWithProgress = withProgressIndicator(OfferForm);
const DashboardArticleTileWithProgress = withProgressIndicator(DashboardArticleTile);

const dynamicFlows: DynamicFlow[] = [
	{
		name: "ui_handling.dashboard-layout",
		scenes: [
			{
				name: "DashboardSingleActivity",
				matches: matchesSingleActivity,
				sceneChange: {
					onEnter: [
						{ type: "DYNAMIC_CLEAR_REGION", region: "/SIDEBAR" },
						{
							type: "DYNAMIC_CLEAR_REGION",
							region: "/CONTENT",
							layout: createDashboardLayout(SINGLE_ACTIVITY_ROWS)
						},
						{
							type: "DYNAMIC_ADD_VIEW",
							component: DashboardIntroTile,
							region: "/CONTENT"
						},
						{
							type: "DYNAMIC_ADD_VIEW",
							component: DashboardCalendarTile,
							region: "/CONTENT"
						},
						{
							type: "DYNAMIC_ADD_VIEW",
							component: DashboardNotesTile,
							region: "/CONTENT"
						},
						{
							type: "DYNAMIC_ADD_VIEW",
							component: DashboardTasksTile,
							region: "/CONTENT"
						},
						{
							type: "DYNAMIC_ADD_VIEW",
							component: DashboardMessagesTile,
							region: "/CONTENT"
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
				name: "DashboardMultipleActivities",
				matches: matchesMultipleActivities,
				sceneChange: {
					onEnter: [
						{ type: "DYNAMIC_CLEAR_REGION", region: "/SIDEBAR" },
						{
							type: "DYNAMIC_CLEAR_REGION",
							region: "/CONTENT",
							layout: createDashboardLayout(MULTIPLE_ACTIVITIES_ROWS)
						}
					]
				}
			},
			{
				name: "DashboardSceneIntroTile",
				priorScene: "DashboardMultipleActivities",
				matches: matchesIntroTile,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: MultipleActivitiesDashboardIntroTile,
							region: "/CONTENT"
						}
					]
				}
			},
			{
				name: "DashboardSceneArticleTile",
				priorScene: "DashboardMultipleActivities",
				matches: matchesArticleTile,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: DashboardArticleTileWithProgress,
							region: "/CONTENT"
						}
					]
				}
			},
			{
				name: "DashboardSceneOverviewCrudTile",
				priorScene: "DashboardMultipleActivities",
				matches: matchesOverviewCrud,
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
				name: "DashboardSceneOverviewOfferTile",
				priorScene: "DashboardMultipleActivities",
				matches: matchesOverviewOffer,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: OfferOverviewWithProgress,
							region: "/CONTENT",
							models: [{ modelType: "document", name: "Offer-document" }]
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
				name: "DashboardSceneOverviewCrudDetail",
				priorScene: "DashboardSceneOverviewCrudTile",
				matches: matchesCrudDetail,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: PersonFormWithProgress,
							region: "/CONTENT",
							models: [{ modelType: "document", name: "Person-document" }]
						}
					]
				}
			},
			{
				name: "DashboardSceneOverviewOfferDetail",
				priorScene: "DashboardSceneOverviewOfferTile",
				matches: matchesOfferDetail,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: OfferFormWithProgress,
							region: "/CONTENT",
							models: [{ modelType: "document", name: "Offer-document" }]
						}
					]
				}
			}
		]
	}
];

function onSingleActivityClick(dispatch: Dispatch): void {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: SINGLE_ACTIVITY_DESCRIPTOR,
				loadingState: "without"
			}),
			descriptor: {}
		})
	);
}

function onMultipleActivitiesClick(dispatch: Dispatch): void {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: MULTIPLE_ACTIVITIES_DESCRIPTOR,
				loadingState: "without"
			}),
			descriptor: {}
		})
	);
}

function selectMenus(state: object): DynamicMenu[] {
	const singleActivities = ActivitySelectors.activitiesByDescriptor(SINGLE_ACTIVITY_DESCRIPTOR)(
		state
	);
	const multipleActivities = ActivitySelectors.activitiesByDescriptor(
		MULTIPLE_ACTIVITIES_DESCRIPTOR
	)(state);
	return [
		{
			id: "ui_handling.dashboard-layout.single-activity",
			label: {
				key: "ui_handling.dashboard-layout.single-activity",
				defaults: { en: "Single Activity", de: "Einzelne Activity" }
			},
			action: onSingleActivityClick,
			selected: singleActivities.at(0) !== undefined
		},
		{
			id: "ui_handling.dashboard-layout.multiple-activities",
			label: {
				key: "ui_handling.dashboard-layout.multiple-activities",
				defaults: { en: "Multiple Activities", de: "Mehrere Activitys" }
			},
			action: onMultipleActivitiesClick,
			selected: multipleActivities.at(0) !== undefined
		}
	];
}

export const DashboardLayoutModule: SampleAppModule = {
	dataLoaders: [articleDataLoader],
	id: "ui_handling.dashboard-layout",
	flows: dynamicFlows,
	menus: selectMenus,
	sagas: () => [createMultipleActivitiesForDashboard]
};
