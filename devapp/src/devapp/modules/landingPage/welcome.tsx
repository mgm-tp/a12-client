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
