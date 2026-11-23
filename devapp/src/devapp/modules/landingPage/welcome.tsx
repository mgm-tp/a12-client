// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";

import { addPrefix } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/utils.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

export function WelcomePage(): JSX.Element {
	return (
		<ActionContentbox headingElements={<ContentBoxElements.Title text="Welcome" ariaLevel={1} />}>
			<div className={addPrefix("-u-text-base")}>
				<p>This Dev App was build with the A12 Client</p>

				<p
					className={addPrefix(
						"-u-background-blue-light -u-text-xl -u-leading-normal -u-negative-margin-l-md -u-negative-margin-r-md -u-padding-t-xl -u-padding-b-2xl -u-text-center"
					)}
				>
					<i>
						The focus of the A12 Client is to provide a model-driven, extensible client runtime.
						<br />
						It&apos;s main function is the orchestration of other UI components, especially A12
						Engines.
						<br />
						It is based on the technologies TypeScript and React.
					</i>
				</p>

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
				</div>
			</div>
		</ActionContentbox>
	);
}
