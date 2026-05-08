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

import { useContext, type JSX } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";
import { SizeContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-context.js";

import isOnSmallDevice from "../../../../utils/isOnSmallDevice.js";

import { ShowDeviceInformation } from "./subComponents.js";

export function StackLayoutView(props: View): JSX.Element {
	const dispatch = useDispatch();
	const initiatingActivityId = useSelector(
		ActivitySelectors.activityPropById(props.activityId, a => a.initiatingActivityId)
	);
	const activityDescriptor = useSelector(
		ActivitySelectors.activityPropById(props.activityId, a => a.descriptor)
	);
	const smallDevice = isOnSmallDevice(useContext(SizeContext).currentSize);

	if (!activityDescriptor) {
		throw new Error("Expected activityDescriptor to exist");
	}

	const firstActivity = initiatingActivityId === undefined;
	return (
		<ActionContentbox
			padding={"24px"}
			listenToNavigationContext
			headingElements={
				<ContentBoxElements.Title
					key="title"
					text={`View for activity with id: ${props.activityId}`}
				/>
			}
		>
			{firstActivity && <ShowDeviceInformation />}
			{firstActivity ? (
				<InitialContent />
			) : (
				<Content activityId={props.activityId} initiatingActivityId={initiatingActivityId} />
			)}
			<Button
				onClick={() =>
					dispatch(
						ActivityActions.create({
							activityDescriptor,
							initiatingActivityId: props.activityId,
							loadingState: "without"
						})
					)
				}
			>
				Start next activity
			</Button>
			{!smallDevice && !firstActivity && (
				<Button
					onClick={() =>
						dispatch(ActivityActions.cancelRequested({ activityIds: [props.activityId] }))
					}
				>
					Cancel
				</Button>
			)}
		</ActionContentbox>
	);
}

function InitialContent(): JSX.Element {
	return (
		<>
			<p>
				This example shows when and how a back-button is displayed when using a Stack layout, with
				views in the content.
			</p>
			<p>
				When clicking &quot;Start next activity&quot; a new activity is started which adds another
				view to the content region. The Stack layout always only shows the last view.
			</p>
			<p>
				As soon as there are more then one view on the view stack a back-button will be displayed in
				the header of the content box. <br />
				The back-button will cancel the current activity to switch back to the previous view.
			</p>
		</>
	);
}

function Content(props: { activityId: string; initiatingActivityId: string }): JSX.Element {
	return (
		<>
			<p>Initiating activity id: {props.initiatingActivityId}</p>
			<p>
				Because there is more then one view on the view stack a back-button is displayed. <br />
				The back-button will cancel the activity with id {props.activityId} to switch back to the
				previous view
			</p>
			<p>
				When clicking &quot;Start next activity&quot; a new activity is started which adds another
				view to the content region. The Stack layout always only shows the last view.
			</p>
		</>
	);
}
