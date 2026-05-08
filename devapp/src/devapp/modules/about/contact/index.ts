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

import type {
	DynamicConfiguration,
	DynamicFlow,
	DynamicMenu
} from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	ApplicationActions
} from "@com.mgmtp.a12.client/client-core";

import { ContactView } from "./page.js";

const CONTACT_DESCRIPTOR = { section: "contact" };

const CONTACT_FLOWS: DynamicFlow[] = [
	{
		name: `about.contact.flow`,
		scenes: [
			{
				name: `about.contact.scene`,
				matches: descriptor => descriptor === CONTACT_DESCRIPTOR,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: ContactView,
							region: "/CONTENT"
						}
					]
				}
			}
		]
	}
];

const CONTACT_ACTION: DynamicMenu["action"] = dispatch => {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: CONTACT_DESCRIPTOR,
				loadingState: "without"
			}),
			descriptor: {}
		})
	);
};

export const ContactModule: DynamicConfiguration = {
	id: "about.contact",
	flows: CONTACT_FLOWS,
	menus(state) {
		return [
			{
				id: `about.contact.dynamicMenu`,
				label: { key: "examples.about.contact.menuEntry" },
				selected: ActivitySelectors.activitiesByDescriptor(CONTACT_DESCRIPTOR)(state).length > 0,
				action: CONTACT_ACTION
			}
		];
	}
};
