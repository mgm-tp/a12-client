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
	DynamicConfiguration,
	DynamicFlow,
	DynamicMenu,
	ViewNGComponent
} from "@com.mgmtp.a12.client/client-core";
import { ActivitySelectors, ApplicationActions } from "@com.mgmtp.a12.client/client-core";

const DESCRIPTOR = { feature: "dashboard" };

// module-level constants: the component and the menu action keep a stable
// identity, everything state-derived travels as plain data
// tag::viewDeclaration[]
interface DashboardProps {
	readonly variant?: string;
}

// the view gets the framework props plus its own DashboardProps
declare const DashboardView: ViewNGComponent<DashboardProps>;
// end::viewDeclaration[]
const openDashboardAction = ApplicationActions.startMainActivityRequested({
	descriptor: DESCRIPTOR
});

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
				// match conditions are only invoked, never compared —
				// creating them inline is fine
				matches: descriptor =>
					descriptor.feature === "dashboard" && descriptor.variant === activity.descriptor.variant,
				sceneChange: {
					// tag::componentProps[]
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW" as const,
							region: "/CONTENT",
							// the component is a module-level constant ...
							component: DashboardView,
							// ... and the state-derived variant travels as plain data
							componentProps: { variant: activity.descriptor.variant }
						}
					]
					// end::componentProps[]
				}
			}))
		}
	];
};

const dynamicMenus = (state: object): DynamicMenu[] => {
	const activities = ActivitySelectors.activitiesByDescriptor(DESCRIPTOR)(state);
	return [
		{
			id: "dashboard-menu",
			label: { key: "application.menu.dashboard" },
			selected: activities.length > 0,
			// a plain action object is deep-compared like all other data
			action: openDashboardAction
		}
	];
};
// end::selectors[]

// tag::module[]
export const DashboardModule: DynamicConfiguration = {
	id: "Dashboard",
	flows: dynamicFlows,
	menus: dynamicMenus
};
// end::module[]
