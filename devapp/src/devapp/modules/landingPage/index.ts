// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { DynamicConfiguration, DynamicFlow } from "@com.mgmtp.a12.client/client-core";

import { WelcomePage } from "./welcome.js";

const WELCOME_FLOWS: DynamicFlow[] = [
	{
		name: `about.welcome.flow`,
		scenes: [
			{
				name: `about.welcome.scene`,
				matches: descriptor => descriptor.section === "welcome",
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: WelcomePage,
							region: "/CONTENT"
						}
					]
				}
			}
		]
	}
];

export const LandingPageModule: DynamicConfiguration = {
	id: "about.welcome",
	flows: WELCOME_FLOWS
};
