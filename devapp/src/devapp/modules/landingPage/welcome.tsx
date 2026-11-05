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
import {
	addPrefix,
	ActionContentbox,
	ContentBoxElements,
	ExternalLink,
	Link
} from "@com.mgmtp.a12.widgets/widgets-core";

declare const __DOCS_AVAILABLE__: boolean;

const docsAvailable = typeof __DOCS_AVAILABLE__ === "boolean" && __DOCS_AVAILABLE__;

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

/** Opens the sub activity with the details of the entry point's application setup. */
function SetupDetailsLink(props: PropsWithChildren): JSX.Element {
	const dispatch = useDispatch();
	return (
		<Link
			useAsButton
			onClick={() =>
				dispatch(
					ApplicationActions.startMainActivityRequested({
						descriptor: { section: "setup-details" }
					})
				)
			}
		>
			{props.children}
		</Link>
	);
}

function WelcomeContent(props: { readonly setup: "composable" | "legacy" }): JSX.Element {
	return (
		<WelcomePageActionBox title="Welcome">
			{docsAvailable && (
				<p>
					Documentation: <ExternalLink href="./doc/manual/index.html">User Manual</ExternalLink> ·{" "}
					<ExternalLink href="./doc/typedoc/index.html">Typedoc</ExternalLink>
				</p>
			)}

			<p>This DevApp was built with the A12 Client</p>

			<WelcomeTagline>
				The focus of the A12 Client is to provide a model-driven, extensible client runtime.
				<br />
				Its main function is the orchestration of other UI components, especially A12 Engines.
				<br />
				It is based on the technologies TypeScript and React.
			</WelcomeTagline>

			<div>
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
					These and more examples can be found in the main menu. It also showcases some Client
					specific components like the LocaleSelect or the VetoDialog.
				</p>

				<p>
					This client application was built using the{" "}
					<SetupDetailsLink>{props.setup} application setup</SetupDetailsLink>.
				</p>
			</div>
		</WelcomePageActionBox>
	);
}

/** Welcome page for the composable devapp entry point, shown at `/index.html`. */
export function ComposableWelcomePage(): JSX.Element {
	return <WelcomeContent setup="composable" />;
}

/** Welcome page for the legacy (pure AppModel) devapp entry point, shown at `/legacy.html`. */
export function WelcomePage(): JSX.Element {
	return <WelcomeContent setup="legacy" />;
}
