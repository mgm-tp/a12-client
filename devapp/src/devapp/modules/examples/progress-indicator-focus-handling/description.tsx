// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { addPrefix } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/utils.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";
import { Typography } from "@com.mgmtp.a12.widgets/widgets-core/lib/typography/main/typography.view.js";

export function DescriptionView(props: View): JSX.Element {
	const dispatch = useDispatch();

	const descriptor = useSelector(
		ActivitySelectors.activityPropById(props.activityId, a => a.descriptor)
	);

	const child = useSelector(ActivitySelectors.childActivityWithInstance(props.activityId));

	const startAriaLevel = props.ariaLevel ? props.ariaLevel + 1 : 2;

	function createChildActivity(instance: string): void {
		if (child) {
			dispatch(ActivityActions.cancel({ activityId: child?.id }));
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
