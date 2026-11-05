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

import type { JSX, PropsWithChildren } from "react";
import { useDispatch } from "react-redux";

import { ApplicationActions } from "@com.mgmtp.a12.client/client-core";
import { Link } from "@com.mgmtp.a12.widgets/widgets-core";

import { WelcomePageActionBox } from "./welcome.js";

function SetupDetailsPage(
	props: PropsWithChildren & {
		readonly title: string;
		readonly switchTo: { readonly label: string; readonly page: string };
	}
): JSX.Element {
	const dispatch = useDispatch();
	return (
		<WelcomePageActionBox title={props.title}>
			{props.children}
			<p>
				<Link href={`./${props.switchTo.page}`}>{props.switchTo.label}</Link>
			</p>
			<p>
				<Link
					useAsButton
					onClick={() =>
						dispatch(
							ApplicationActions.startMainActivityRequested({
								descriptor: { section: "welcome" }
							})
						)
					}
				>
					Back to the welcome page
				</Link>
			</p>
		</WelcomePageActionBox>
	);
}

export function ComposableSetupDetails(): JSX.Element {
	return (
		<SetupDetailsPage
			title="Composable Application Setup"
			switchTo={{ label: "Switch to the legacy entry point", page: "legacy.html" }}
		>
			<p>This entry point uses the composable application setup.</p>
			<p>
				<strong>Setup API:</strong> Composable factory (<code>combineFeatures</code> +{" "}
				<code>createA12ApplicationSetup</code>)
			</p>
			<p>
				<strong>Scene modeling:</strong> Pure Dynamic Config modules (
				<code>DynamicConfiguration</code>)
			</p>
			<p>
				No application model JSON is loaded. Regions, flows, scenes, and menus are all defined
				programmatically through <code>DynamicConfiguration</code> modules. Document models are
				still loaded via <code>withHTTPModelLoader</code> for forms.
			</p>
		</SetupDetailsPage>
	);
}

export function LegacySetupDetails(): JSX.Element {
	return (
		<SetupDetailsPage
			title="Legacy Application Setup"
			switchTo={{ label: "Switch to the composable entry point", page: "index.html" }}
		>
			<p>This entry point uses the legacy application setup.</p>
			<p>
				<strong>Setup API:</strong> Prop-based factory with AppModel (
				<code>ApplicationFactories.createApplicationSetup</code>)
			</p>
			<p>
				<strong>Scene modeling:</strong> Classic AppModel with <code>app_model.json</code>{" "}
				flows/scenes (no Dynamic Config)
			</p>
			<p>
				This entry point demonstrates the legacy AppModel-based approach (pre-Dynamic Config). It
				uses:
			</p>
			<ul>
				<li>
					Classic <code>Module</code> objects with <code>views</code> property
				</li>
				<li>
					Application model defined in <code>app_model.json</code> (flows, scenes, matchConditions,
					directives)
				</li>
				<li>
					Menu items read directly from <code>ApplicationModel.modules[].menu</code>
				</li>
				<li>
					Classic <code>DefaultRegionUi</code> rendering (not DynamicRegionUi)
				</li>
			</ul>
		</SetupDetailsPage>
	);
}
