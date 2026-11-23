// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { type JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Action } from "typescript-fsa";

import type { ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, DynamicRegionUi } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";
import { Icon } from "@com.mgmtp.a12.widgets/widgets-core/lib/icon/main/icon.view.js";
import { ButtonGroupContainer } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/button-group-container/main/button-group-container.view.js";

import { addDataHolder } from "./actions.js";
import { EXAMPLE_DESCRIPTOR, selectExampleActivity } from "./descriptor.js";
import { createDataHolder } from "./reducers.js";

export const EXAMPLE_REGION = "dataHandlingSagas-actual";

export function FrameView(props: ViewNGProps): JSX.Element {
	const dispatch = useDispatch();

	const activityId = useSelector(state => selectExampleActivity(state)?.id);

	return (
		<ActionContentbox
			headingElements={<ContentBoxElements.Title text="Data handling sagas" />}
			footer={
				activityId && (
					<ContentBoxElements.Footer>
						<ButtonGroupContainer
							leftSlotButtons={[
								{
									label: "add dataholder",
									icon: <Icon>add</Icon>,
									onClick: () => dispatch(addDataHolder({ activityId }))
								}
							]}
							rightSlotButtons={[
								{
									label: "load (missing only)",
									icon: <Icon>refresh</Icon>,
									onClick: () =>
										dispatch(ActivityActions.loadData({ activityId, missingOnly: true }))
								},
								{
									label: "reload",
									icon: <Icon>refresh</Icon>,
									onClick: () => dispatch(ActivityActions.reloadData({ activityId }))
								},
								{
									label: "save",
									icon: <Icon>save</Icon>,
									primary: true,
									onClick: () => dispatch(ActivityActions.save.started({ activityId }))
								},
								{
									label: "commit",
									icon: <Icon>check</Icon>,
									primary: true,
									onClick: () => dispatch(ActivityActions.commit.started({ activityId }))
								}
							]}
						/>
					</ContentBoxElements.Footer>
				)
			}
		>
			<p>
				This example demonstrates the functionality of the internal data sagas when handling
				dataholders.
			</p>
			<p>
				When the example activity exists, the footer buttons trigger the builtin client actions to
				load, save and commit it. Note: The example activity is embedded into this view using the
				DynamicConfiguration feature. This is done to keep this view visible when committing.
			</p>
			<p>
				Each dataholder can trigger their own load and save, which is achieved by setting the
				property &quot;dataHolderDescriptors&quot; in the action payload. Deleting a data holder is
				achieved by using the builtin removeData action. Note that the default dataholder cannot be
				removed (as an activity always requires it).
			</p>
			<p>
				To simulate updating the activity instance, the additional checkbox of the default
				dataholder can be used. When checked, saving this dataholder will assign a new instance to
				its descriptor (subsequently updating the activity descriptor as well)
			</p>
			{/** the example activity renders inside this region */}
			<DynamicRegionUi regionRef={EXAMPLE_REGION} />
			{!activityId && (
				<Button
					label={"Create example activity"}
					onClick={() => dispatch(createExampleActivity(props.activityId))}
				></Button>
			)}
		</ActionContentbox>
	);
}

export function createExampleActivity(
	datasourceActivityId: string
): Action<ActivityActions.PushPayload> {
	const { activity } = ActivityActions.create({
		activityDescriptor: EXAMPLE_DESCRIPTOR,
		initiatingActivityId: datasourceActivityId,
		loadingState: "missing"
	}).payload;

	return ActivityActions.push({
		activity: {
			...activity,
			dataHolders: activity.dataHolders
				.with(0, { ...activity.dataHolders[0], datasourceActivityId })
				.concat([1, 2].map(createDataHolder))
		}
	});
}
