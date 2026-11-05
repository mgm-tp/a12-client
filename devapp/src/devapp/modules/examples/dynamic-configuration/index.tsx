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
	DynamicMenu,
	DynamicRegion,
	DynamicScene,
	RegionReferenceNG
} from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	ApplicationActions
} from "@com.mgmtp.a12.client/client-core";

import { DynamicLayoutComponent } from "./DynamicConfigLayout.js";
import { dynamicRegionName } from "./dynamicRegionName.js";
import { DynamicView } from "./DynamicView.js";
import { uiSlice } from "./uiState.js";

const MODULE_ID = `examples.DC`;

/**
 * An example module that showcases the {@link DynamicConfiguration} API.
 *
 * Instead of setting an application model and a view provider that matches the view names from scenes to react components,
 * this module contributes everything dynamically, e.g. based on state.
 *
 * ### Note on stability & performance
 *
 * Since the contributions are selectors, they will run on every state change. The client core deep-compares
 * the results and reuses the previous result when nothing changed, so freshly created objects, arrays and
 * strings are unproblematic. Functions however are compared by reference (===): a component or callback that
 * is re-created inside a selector makes every state change look like a relevant change, causing excessive
 * re-renderings (and re-mounts, in the case of components).
 *
 * Therefore all contributed components in this example are declared at module level, and everything
 * activity-specific reaches them as plain data:
 *
 * - The layout component receives the id of its activity via the layout's `componentProps`
 *   (see {@link DynamicLayoutComponent}).
 * - The view component receives the id of its activity as a prop and selects everything else from the
 *   state (see {@link DynamicView}).
 *
 * The match conditions of the scenes need no such care: they are only invoked, never compared,
 * so creating them inside the selector is fine.
 *
 * ### Contributions
 *
 * #### Regions
 *
 * Each relevant (as in: relevant for this example) activity creates its own region. The region name
 * contains the id of the activity, since region names must be unique.
 *
 * The layout of the region receives the id of its activity via `componentProps`, so layout specific
 * data (like a UI state) can be stored in the activity (see {@link DynamicLayoutComponent}).
 *
 * #### Flows
 *
 * A single flow is created, containing a scene per relevant activity. Each scene will render a view component, that in turn
 * renders its dynamic region.
 *
 * If the activity has a parent, it will be rendered in the region of its parent (which is possible since each activity defines its on region
 * containing the id in the name).
 *
 * The first activity (which has no parent) will render in the CONTENT region of the AppFrame.
 *
 * #### Menus
 *
 * A single menu entry is created that triggers the creation of the first activity on click.
 * The `selected` state is based on whether at least one relevant activity exists.
 *
 * The label of the menu contains the current number of relevant activities. Therefore, when new activities are created in this example,
 * the menu entry will stay selected, but update its label.
 */
export const DynamicConfigurationExampleModule: DynamicConfiguration = {
	id: MODULE_ID,
	regions: dynamicRegions,
	flows: dynamicFlows,
	menus: dynamicMenus,
	dataReducers: () => [uiSlice.dataReducer]
};

function dynamicRegions(state: object): DynamicRegion[] {
	return selectRelevantActivities(state).map(activityRegion);
}

function activityRegion(activity: Activity): DynamicRegion {
	return {
		name: dynamicRegionName(activity.id),
		layout: {
			component: DynamicLayoutComponent,
			componentProps: { activityId: activity.id }
		}
	};
}

function dynamicFlows(state: object): DynamicFlow[] {
	return [
		{
			name: `${MODULE_ID}.flow`,
			scenes: selectRelevantActivities(state).map(activityScene)
		}
	];
}

function activityScene(activity: Activity): DynamicScene {
	const { initiatingActivityId } = activity;

	const viewRegion: RegionReferenceNG = initiatingActivityId
		? dynamicRegionName(initiatingActivityId)
		: "/CONTENT";

	function matchesInitiatingActivity(descriptor: Activity.Descriptor): boolean {
		return descriptor.shouldShowUpInActivity === initiatingActivityId;
	}

	return {
		name: `scene-${activity.id}`,
		matches: matchesInitiatingActivity,
		sceneChange: {
			onEnter: [
				{
					type: "DYNAMIC_ADD_VIEW",
					component: DynamicView,
					region: viewRegion
				}
			]
		}
	};
}

function dynamicMenus(state: object): DynamicMenu[] {
	const activityCount = selectRelevantActivities(state).length;

	return [
		{
			id: `${MODULE_ID}.dynamicMenu`,
			label: {
				key: "dc",
				defaults: {
					en: `Dynamic configuration (${activityCount})`,
					de: `Dynamische Konfiguration (${activityCount})`
				}
			},
			selected: activityCount > 0,
			action: startDynamicConfigurationActivity
		}
	];
}

function startDynamicConfigurationActivity(dispatch: Dispatch): void {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: {
					feature: "dynamicConfiguration"
				},
				loadingState: "without"
			}),
			descriptor: {}
		})
	);
}

function selectRelevantActivities(state: object): Activity[] {
	return Object.values(ActivitySelectors.activities()(state)).flatMap(a =>
		a?.descriptor.feature === "dynamicConfiguration" ? a : []
	);
}
