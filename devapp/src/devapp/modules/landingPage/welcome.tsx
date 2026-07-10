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

import {
	addPrefix,
	ActionContentbox,
	ContentBoxElements
} from "@com.mgmtp.a12.widgets/widgets-core";

export function WelcomePageActionBox(
	props: PropsWithChildren & { readonly title: string }
): JSX.Element {
	return (
		<ActionContentbox
			headingElements={<ContentBoxElements.Title text={props.title} ariaLevel={1} />}
		>
			<div className={addPrefix("-u-text-base")}>{props.children}</div>
		</ActionContentbox>
	);
}

/** Styled tagline block used across welcome pages. */
export function WelcomeTagline(props: PropsWithChildren): JSX.Element {
	return (
		<p
			className={addPrefix(
				"-u-background-blue-light -u-text-xl -u-leading-normal -u-negative-margin-l-md -u-negative-margin-r-md -u-padding-t-xl -u-padding-b-2xl -u-text-center"
			)}
		>
			<i>{props.children}</i>
		</p>
	);
}

/**
 * Default welcome page for the legacy (pure AppModel) devapp entry point.
 *
 * This is shown at `/legacy.html` and uses classic `ApplicationFactories.createApplicationSetup`
 * with only classic Modules (no DynamicConfiguration). It showcases the legacy AppModel-based approach.
 */
export function WelcomePage(): JSX.Element {
	return (
		<WelcomePageActionBox title="Welcome — Client DevApp (Legacy Entry Point)">
			<p>
				You are using the <strong>legacy (pure AppModel)</strong> devapp entry point.
			</p>

			<WelcomeTagline>
				The focus of the A12 Client is to provide a model-driven, extensible client runtime.
				<br />
				It&apos;s main function is the orchestration of other UI components, especially A12 Engines.
				<br />
				It is based on the technologies TypeScript and React.
			</WelcomeTagline>

			<div>
				<p>
					<strong>Setup API:</strong> Prop-based factory with AppModel (
					<code>ApplicationFactories.createApplicationSetup</code>)
				</p>
				<p>
					<strong>Scene modeling:</strong> Classic AppModel with <code>app_model.json</code>{" "}
					flows/scenes (no Dynamic Config)
				</p>

				<p>
					This entry point demonstrates the <strong>legacy AppModel-based</strong> approach
					(pre-Dynamic Config). It uses:
				</p>
				<ul>
					<li>
						Classic <code>Module</code> objects with <code>views</code> property
					</li>
					<li>
						Application model defined in <code>app_model.json</code> (flows, scenes,
						matchConditions, directives)
					</li>
					<li>
						Menu items read directly from <code>ApplicationModel.modules[].menu</code>
					</li>
					<li>
						Classic <code>DefaultRegionUi</code> rendering (not DynamicRegionUi)
					</li>
				</ul>

				<p>The menu contains the following entries:</p>
				<ul>
					<li>
						<strong>Master-Detail-Flow</strong> — demonstrates a master-detail navigation flow
					</li>
					<li>
						<strong>About</strong> — contains sub-items:
						<ul>
							<li>
								<strong>Contact</strong> — simple static content view
							</li>
							<li>
								<strong>Version Information</strong> — displays application version details
							</li>
						</ul>
					</li>
				</ul>

				<p>Other entry points:</p>
				<ul>
					<li>
						<a href="./index.html">[Composable] Client DevApp</a> — composable API with Dynamic
						Config
					</li>
				</ul>
			</div>
		</WelcomePageActionBox>
	);
}
