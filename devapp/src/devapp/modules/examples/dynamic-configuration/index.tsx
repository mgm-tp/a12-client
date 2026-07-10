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

import type {
	Activity,
	DynamicConfiguration,
	DynamicFlow,
	DynamicMatchCondition,
	DynamicMenu,
	DynamicRegion,
	LayoutPropsNG,
	RegionReferenceNG,
	ViewNGProps
} from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	ApplicationActions
} from "@com.mgmtp.a12.client/client-core";

import { memoize } from "../../../3rd-party-licenses/memoize.js";

import { DynamicLayoutComponent } from "./DynamicConfigLayout.js";
import { DynamicView } from "./DynamicView.js";
import { uiSlice } from "./uiState.js";

const MODULE_ID = `examples.DC`;

function dynamicRegionName(id: string): string {
	return `DYNAMIC-${id}`;
}

/**
 * An example module that showcases the {@link DynamicConfiguration} API.
 *
 * Instead of setting an application model and a view provider that matches the view names from scenes to react components,
 * this module contributes everything dynamically, e.g. based on state.
 *
 * ### Note on memoization & performance
 *
 * Since the contributions are selectors, they will run on every state change. Therefore it is important to ensure stable return values, i.e.
 * returning the same value (===) when the state change was not relevant to the output.
 *
 * Since in this example, the return values contain functions,
 * memoization is used when necessary to prevent performance problems due to excessive re-renderings.
 *
 * If possible, stable return values can also be achieved by moving non-dynamic parts out of the selector, e.g.
 * when the contributed menu entry is always the same (it does not depend on any state).
 *
 * ### Contributions
 *
 * #### Regions
 *
 * Each relevant (as in: relevant for this example) activity creates its own region, defining its own layout component.
 *
 * Since the layout component receives the id of the activity as a prop, layout specific data (like a UI state) can be
 * stored in the activity (see {@link DynamicLayoutComponent}).
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

const createMemoizedLayout = memoize((activityId: string) => {
	return function DynamicLayout(props: LayoutPropsNG) {
		return <DynamicLayoutComponent {...props} activityId={activityId} />;
	};
});

const createMemoizedView = memoize((hideContentbox: boolean) => {
	return function DynamicViewWrapper(props: ViewNGProps) {
		return (
			<DynamicView
				{...props}
				hideContentbox={hideContentbox}
				dynamicRegionRef={dynamicRegionName(props.activityId)}
			/>
		);
	};
});

const createMemoizedMatcher = memoize((initiatingActivityId?: string) => {
	const matcher: DynamicMatchCondition = descriptor =>
		descriptor.shouldShowUpInActivity === initiatingActivityId;

	return matcher;
});

function dynamicRegions(state: object): DynamicRegion[] {
	return selectRelevantActivities(state).map(activity => {
		const { id } = activity;

		return {
			name: dynamicRegionName(id),
			layout: {
				component: createMemoizedLayout(id)
			}
		};
	});
}

function dynamicFlows(state: object): DynamicFlow[] {
	return [
		{
			name: `${MODULE_ID}.flow`,
			scenes: selectRelevantActivities(state).map(activity => {
				const { initiatingActivityId } = activity;

				const viewRegion: RegionReferenceNG = initiatingActivityId
					? dynamicRegionName(initiatingActivityId)
					: "/CONTENT";

				return {
					name: `scene-${activity.id}`,
					matches: createMemoizedMatcher(initiatingActivityId),
					sceneChange: {
						onEnter: [
							{
								type: "DYNAMIC_ADD_VIEW",
								component: createMemoizedView(initiatingActivityId !== undefined),
								region: viewRegion
							}
						]
					}
				};
			})
		}
	];
}

const createMemoizedMenu = memoize((activityCount: number): DynamicMenu[] => {
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
			action: dispatch => {
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
		}
	];
});

function dynamicMenus(state: object): DynamicMenu[] {
	const activities = selectRelevantActivities(state);

	return createMemoizedMenu(activities.length);
}

function selectRelevantActivities(state: object): Activity[] {
	return Object.values(ActivitySelectors.activities()(state)).flatMap(a =>
		a?.descriptor.feature === "dynamicConfiguration" ? a : []
	);
}
