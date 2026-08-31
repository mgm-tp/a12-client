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

import type { FunctionComponent } from "react";

import type {
	DynamicConfiguration,
	DynamicFlow,
	DynamicMatchCondition,
	DynamicMenu,
	ViewNGComponent,
	ViewNGProps
} from "@com.mgmtp.a12.client/client-core";
import { ActivitySelectors, ApplicationActions } from "@com.mgmtp.a12.client/client-core";

declare const DashboardView: FunctionComponent<ViewNGProps & { variant: string }>;
declare function memoize<T extends (...args: never[]) => unknown>(fn: T): T;

// tag::memoization[]
const DESCRIPTOR = { feature: "dashboard" };

// Memoize component factories to ensure referential stability
const createMemoizedView = memoize((variant: string): ViewNGComponent => (props: ViewNGProps) => (
	<DashboardView {...props} variant={variant} />
));

const createMemoizedMatcher = memoize(
	(variant: string): DynamicMatchCondition =>
		descriptor =>
			descriptor.feature === "dashboard" && descriptor.variant === variant
);

const createMemoizedMenu = memoize((isSelected: boolean): DynamicMenu[] => [
	{
		id: "dashboard-menu",
		label: { key: "application.menu.dashboard" },
		selected: isSelected,
		action: dispatch =>
			dispatch(ApplicationActions.startMainActivityRequested({ descriptor: DESCRIPTOR }))
	}
]);
// end::memoization[]

// tag::selectors[]
const dynamicFlows = (state: object): DynamicFlow[] => {
	const activities = Object.values(ActivitySelectors.activities()(state));
	const dashboardActivities = activities.flatMap(a =>
		a?.descriptor.feature === "dashboard" ? a : []
	);

	return [
		{
			name: "dashboard.flow",
			scenes: dashboardActivities.map(activity => ({
				name: `dashboard.${activity.descriptor.variant}`,
				matches: createMemoizedMatcher(activity.descriptor.variant as string),
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW" as const,
							region: "/CONTENT",
							component: createMemoizedView(activity.descriptor.variant as string)
						}
					]
				}
			}))
		}
	];
};

const dynamicMenus = (state: object): DynamicMenu[] => {
	const activities = ActivitySelectors.activitiesByDescriptor(DESCRIPTOR)(state);
	const isSelected = activities.length > 0;
	return createMemoizedMenu(isSelected);
};
// end::selectors[]

// tag::module[]
export const DashboardModule: DynamicConfiguration = {
	id: "Dashboard",
	flows: dynamicFlows,
	menus: dynamicMenus
};
// end::module[]
