// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
