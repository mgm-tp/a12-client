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

import { ActionContentbox, ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core";

/**
 * A view component to describe the example in the dev app.
 * It is not required in your productive environment.
 */
export function FocusHandlingDescription(props: { readonly ariaLevel?: number }): JSX.Element {
	return (
		<ActionContentbox
			listenToNavigationContext
			headingElements={
				<ContentBoxElements.Title text="Focus Handling" ariaLevel={props.ariaLevel} />
			}
		>
			<p>
				This example demonstrates how projects can define their own focus behavior. It shows a
				customized focus handling in the devapp when switching between Views in the Master Detail
				Layout. Before implementing a custom solution, check if the related Engine already
				implements it or if they provide a specialized API.
			</p>
			<p>The custom behavior includes the following points:</p>
			<ul>
				<li>After pushing the form activity, the whole form view is focused.</li>
				<li>
					After canceling the creation of a new document in the form activity, the add button is
					focused in the overview view.
				</li>
				<li>
					After canceling or committing an existing document in the form activity, the related row
					is focused in the overview view.
				</li>
			</ul>
			<p>The code is bundled in an own focus handling module. Roughly summarized, it contains:</p>
			<ul>
				<li>A saga processing the activity actions mentioned above</li>
				<li>A focus function focusing a DOM element based on the activity data</li>
				<li>
					A view component provider wrapping the affected view components with a div having an
					activity specific ID. The ID can later be used to focus the entire view only by knowing
					the activity ID.
				</li>
			</ul>
		</ActionContentbox>
	);
}
