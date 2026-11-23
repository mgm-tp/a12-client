// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AnyAction } from "redux";

import type { ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	NEW_INSTANCE_IDENTIFIER
} from "@com.mgmtp.a12.client/client-core";
import { ButtonGroup } from "@com.mgmtp.a12.widgets/widgets-core/lib/button-group/main/button-group.view.js";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { addPrefix } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/utils.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";
import { Typography } from "@com.mgmtp.a12.widgets/widgets-core/lib/typography/main/typography.view.js";

export function DynamicModelsSelect({ activityId, ariaLevel }: ViewNGProps): JSX.Element {
	const dispatch = useDispatch();
	const actionCreator = useCreateOrReplaceChildActivityActionCreator(activityId);

	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title ariaLevel={ariaLevel ?? 2} text="Dynamic Model Loading" />
			}
			listenToNavigationContext
		>
			<Typography.Section className={addPrefix("-u-max-width-sm")}>
				<Typography.Headline level={2} ariaLevel={ariaLevel ? ariaLevel + 1 : 3}>
					Description
				</Typography.Headline>
				<Typography.Body>
					<p>
						This example illustrates how models can be loaded without modeling them as part of the
						application model. It uses the &quot;DynamicConfiguration&quot; API to decide the models
						for a scene based on Redux state (the activity descriptor in this case). Manually
						triggering model or data loading is not necessary.
					</p>
					<p>
						Below you can see two buttons that you can press. Both trigger the creation of an
						activity with an activity descriptor that contains a &quot;taskType&quot; property. The
						opened view renders the model header of the selected model. A proper application would
						render the model with a A12 Engine.
					</p>
				</Typography.Body>
			</Typography.Section>
			<ButtonGroup>
				{["Offer", "Person"].map(task => (
					<Button
						key={task}
						label={task}
						onClick={() => {
							dispatch(actionCreator(task));
						}}
					/>
				))}
			</ButtonGroup>
		</ActionContentbox>
	);
}

function useCreateOrReplaceChildActivityActionCreator(
	initiatingActivityId: string
): (taskType: string) => AnyAction {
	const descriptor = useSelector(
		ActivitySelectors.activityPropById(initiatingActivityId, activity => activity.descriptor)
	);
	const childActivity = useSelector(
		ActivitySelectors.childActivityWithInstance(initiatingActivityId)
	);
	return taskType => {
		const pushAction = ActivityActions.create({
			initiatingActivityId: initiatingActivityId,
			activityDescriptor: {
				...descriptor,
				taskType,
				instance: NEW_INSTANCE_IDENTIFIER
			}
		});
		if (childActivity) {
			return ActivityActions.cancelRequested({
				activityIds: [childActivity.id],
				replacementActivity: pushAction.payload.activity
			});
		}
		return pushAction;
	};
}
