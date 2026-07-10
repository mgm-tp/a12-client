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
import { useDispatch, useSelector } from "react-redux";

import type { ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import {
	Button,
	addPrefix,
	ActionContentbox,
	ContentBoxElements,
	Icon
} from "@com.mgmtp.a12.widgets/widgets-core";

export function ErrorBoundaries(props: ViewNGProps): JSX.Element {
	const dispatch = useDispatch();

	const descriptor = useSelector(
		ActivitySelectors.activityPropById(props.activityId, a => a.descriptor)
	);

	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title key="title" text="Error Boundaries" ariaLevel={props.ariaLevel} />
			}
			footer={<ContentBoxElements.Footer />}
		>
			<h3>Background</h3>
			<p>
				Error boundaries are React components that catch JavaScript errors anywhere in their child
				component tree, log those errors, and display a fallback UI instead of the component tree
				that crashed. Error boundaries catch errors during rendering, in lifecycle methods, and in
				constructors of the whole tree below them.
			</p>

			<h3>Example</h3>
			<p>
				When clicking the button below, it dispatches an action to open a broken overview engine.
				The engine crashes because it throws a JavaScript error as the first statement in the render
				method. Instead of breaking the whole app, the Client now renders a fallback component which
				may show some information about the error. It uses a default error boundary. You can fully
				customize the error boundary as well as the error boundary fallback component.
			</p>
			<Button
				onClick={() =>
					dispatch(
						ActivityActions.create({
							activityDescriptor: {
								...descriptor,
								feature: "EngineWithError",
								model: "Book-document"
							},
							initiatingActivityId: props.activityId
						})
					)
				}
				primary
				icon={<Icon>flash_on</Icon>}
				label="Click me"
				className={addPrefix("-u-margin-b-sm")}
			/>
			<h3>Customization</h3>
			<p>
				You can implement a new error boundary provider function and pass it as props to the
				RegionUi component within the Client application setup. Please see the documentation for a
				code example.
			</p>
		</ActionContentbox>
	);
}
