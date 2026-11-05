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
	Typography
} from "@com.mgmtp.a12.widgets/widgets-core";

export function DescriptionView(props: ViewNGProps): JSX.Element {
	const dispatch = useDispatch();

	const descriptor = useSelector(
		ActivitySelectors.activityPropById(props.activityId, a => a.descriptor)
	);

	const child = useSelector(ActivitySelectors.childActivityWithInstance(props.activityId));

	const startAriaLevel = props.ariaLevel ? props.ariaLevel + 1 : 2;

	function createChildActivity(instance: string): void {
		if (child !== undefined) {
			dispatch(ActivityActions.cancel({ activityId: child.id }));
		}

		dispatch(
			ActivityActions.create({
				activityDescriptor: {
					...descriptor,
					instance
				},
				loadingState: "missing",
				initiatingActivityId: props.activityId
			})
		);
	}

	return (
		<ActionContentbox
			headingElements={<ContentBoxElements.Title text="Description" ariaLevel={props.ariaLevel} />}
		>
			<div className={addPrefix("-u-max-width-md")}>
				<Typography.Headline level={4} ariaLevel={startAriaLevel}>
					Introduction
				</Typography.Headline>
				<Typography.Body>
					This example demonstrates the focus handling for a partial progress indicator.
					<br />
					A partial progress indicator will be rendered above some content which is loaded (e.g. a
					form).
					<br />
					From an accessibility point of view it is important that the progress indicator gets the
					focus when it appears and the loaded content gets the focus after the progress indicator
					disappeared (e.g. the content is loaded).
					<br />
					Furthermore, it is important that all elements in the rendered content are disabled or
					without a tab index while loading, so that they can not be focused. <br />
					<br />
					This example contains to sub-examples which will be described in the following parts.
				</Typography.Body>

				<Typography.Headline level={4} ariaLevel={startAriaLevel}>
					Example 1
				</Typography.Headline>
				<Typography.Body>
					If you click the button <b>Open view with general Progress Indicator</b>, a new activity
					will be opened which shows a progress indicator for 3 seconds.
					<br />
					After the progress indicator disappeared the ActionContentBox of the view is focused and
					the first tab goes to the first interactive element.
					<br />
					This behavior is archived by a custom progress component provider which sets the prop
					&quot;focusOnOpen&quot; of the progress indicator and takes care of focusing the nearest
					content box of the parent element of the progress indicator, once the loading is done.
				</Typography.Body>
				<br />
				<Button primary onClick={() => createChildActivity("viewWithApplicationProgressIndicator")}>
					Open view with application progress indicator
				</Button>
				<br />
				<br />

				<Typography.Headline level={4} ariaLevel={startAriaLevel}>
					Example 2
				</Typography.Headline>
				<Typography.Body>
					If you click the button <b>Open view with own Progress Indicator</b>, a new activity will
					be opened which also shows a progress indicator for 3 seconds.
					<br />
					In comparison to &quot;Example 1&quot; this view does not have a content-box. Therefore,
					the approach described above does not work.
					<br />
					In this case the view needs to take care of rendering its own progress indicator to make
					sure the right element is focused after the loading is done. You can find the code for
					this in the Client devapp code under
					<p style={{ fontStyle: "italic" }}>
						src\devapp\src\modules\examples\progress-indicator-focus-handling\viewWithOwnProgressIndicator.tsx
					</p>
					<br />
					<b>Attention: </b> For this case you still need to write a custom progress indicator
					provider that customizes the &quot;ProgressIndicator&quot; widget via the
					&quot;ClientWidgetMapContext&quot; to be able to set the prop &quot;focusOnOpen&quot;.
				</Typography.Body>
				<br />
				<Button primary onClick={() => createChildActivity("viewWithOwnProgressIndicator")}>
					Open view with own progress indicator
				</Button>
			</div>
		</ActionContentbox>
	);
}
