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
