// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

const childDescriptor = {
	section: "ErrorHandling",
	feature: "CommitErrorHandling",
	instance: "1"
};

export default function CommitErrorHandlingFeature(props: View): JSX.Element {
	const dispatch = useDispatch();
	const activeChildActivities = useSelector(
		ActivitySelectors.activitiesByDescriptor(childDescriptor)
	);

	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title text="Commit Error Feature" ariaLevel={props.ariaLevel} />
			}
		>
			<p>
				When clicking the button below, an activity will be started which showcases a commit error
				on the first commit button click and a successful commit on the second click.
			</p>
			<Button
				onClick={() => {
					if (activeChildActivities !== undefined) {
						for (const activity of activeChildActivities) {
							dispatch(ActivityActions.cancel({ activityId: activity.id }));
						}
					}

					dispatch(
						ActivityActions.create({
							activityDescriptor: childDescriptor,
							initiatingActivityId: props.activityId
						})
					);
				}}
				label={"Start Error Activity"}
				primary
			/>
		</ActionContentbox>
	);
}
