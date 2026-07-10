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
	DynamicRegion,
	ViewNGComponent
} from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ApplicationActions,
	ApplicationFrameLayoutNG,
	MasterDetailRegionLayoutNG
} from "@com.mgmtp.a12.client/client-core";

declare const PersonOverview: ViewNGComponent;
declare const PersonDetail: ViewNGComponent;

// tag::regions[]
const regions: DynamicRegion[] = [
	{
		name: "",
		layout: ApplicationFrameLayoutNG,
		subRegions: [{ name: "CONTENT", layout: MasterDetailRegionLayoutNG }]
	}
];
// end::regions[]

// tag::flows[]
const DESCRIPTOR = { feature: "person" };

const flows: DynamicFlow[] = [
	{
		name: "person.flow",
		scenes: [
			{
				name: "person.overview",
				matches: descriptor => descriptor.feature === "person" && !descriptor.instance,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							region: "/CONTENT",
							component: PersonOverview
						}
					]
				}
			},
			{
				name: "person.detail",
				matches: descriptor => descriptor.feature === "person" && !!descriptor.instance,
				priorScene: "person.overview",
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							region: "/CONTENT",
							component: PersonDetail
						}
					]
				}
			}
		]
	}
];
// end::flows[]

// tag::menus[]
const menus: DynamicMenu[] = [
	{
		id: "person-menu",
		label: { key: "application.menu.person" },
		action: dispatch =>
			dispatch(
				ApplicationActions.startMainActivityRequested({
					descriptor: {},
					action: ActivityActions.create({ activityDescriptor: DESCRIPTOR })
				})
			)
	}
];
// end::menus[]

// tag::module[]
export const PersonConfiguration: DynamicConfiguration = {
	id: "Person",
	regions,
	flows,
	menus
};
// end::module[]
