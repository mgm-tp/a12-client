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

import type { JSX } from "react";

import { type DynamicConfiguration } from "@com.mgmtp.a12.client/client-core";

import { WelcomePageActionBox, WelcomeTagline } from "./welcome.js";

export { WelcomePage } from "./welcome.js";

export const LandingPageModule: DynamicConfiguration = {
	id: "about.welcome",
	flows: [
		{
			name: "about.welcome.flow",
			scenes: [
				{
					name: "about.welcome.scene",
					matches: descriptor => descriptor.section === "welcome",
					sceneChange: {
						onEnter: [
							{
								type: "DYNAMIC_ADD_VIEW",
								component: ComposableWelcomePage,
								region: "/CONTENT"
							}
						]
					}
				}
			]
		}
	]
};

function ComposableWelcomePage(): JSX.Element {
	return (
		<WelcomePageActionBox title="Welcome — [Composable] Client DevApp">
			<p>
				You are using the <strong>composable factory API</strong> devapp entry point with{" "}
				<strong>pure dynamic configuration</strong>.
			</p>

			<WelcomeTagline>
				This entry point uses the composable approach to setting up an A12 application
				<br />
				using <code>combineFeatures()</code> and <code>createA12ApplicationSetup()</code>.
				<br />
				No application model, no adapters — all UI structure is defined via{" "}
				<code>DynamicConfiguration</code> modules.
			</WelcomeTagline>

			<div>
				<p>
					<strong>Setup API:</strong> Composable factory (<code>combineFeatures</code> +{" "}
					<code>createA12ApplicationSetup</code>)
				</p>
				<p>
					<strong>Scene modeling:</strong> Pure Dynamic Config modules (
					<code>DynamicConfiguration</code>)
				</p>
				<p>
					<strong>What&apos;s different:</strong> No application model JSON is loaded. Regions,
					flows, scenes, and menus are all defined programmatically through{" "}
					<code>DynamicConfiguration</code> modules. Document models are still loaded via{" "}
					<code>withHTTPModelLoader</code> for forms.
				</p>

				<p>The application demonstrates features like:</p>
				<ul>
					<li>Model and Data Loading</li>
					<li>Layouts (Application Frame, Master Detail, Dashboard, Stack, Null)</li>
					<li>Regions</li>
					<li>Deep Linking</li>
					<li>Heterogeneity</li>
					<li>Notifications</li>
					<li>Permissions</li>
					<li>Dirty Handling</li>
					<li>Error Handling</li>
				</ul>

				<p>
					Other entry point: <a href="./legacy.html">[Legacy] Client DevApp</a>
				</p>
			</div>
		</WelcomePageActionBox>
	);
}
