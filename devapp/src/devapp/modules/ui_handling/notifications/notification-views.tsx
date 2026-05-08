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

import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { ActivityMap, View } from "@com.mgmtp.a12.client/client-core";
import { ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { ButtonGroup } from "@com.mgmtp.a12.widgets/widgets-core/lib/button-group/main/button-group.view.js";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import type { SelectItem } from "@com.mgmtp.a12.widgets/widgets-core/lib/input/select/main/select.api.js";
import { TextAffix } from "@com.mgmtp.a12.widgets/widgets-core/lib/input/text-field/text-field.view.js";
import type { LayoutGridProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.api.js";
import { LayoutGrid } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.view.js";
import { HintTooltip } from "@com.mgmtp.a12.widgets/widgets-core/lib/tooltip/hint/main/hint.view.js";

import { useSingleDocumentValue } from "../../../mocks/SimpleForm/hooks.js";
import {
	NumberInput,
	SelectInput,
	SimpleForm,
	SimpleFormActions,
	StringInput
} from "../../../mocks/SimpleForm/index.js";
import { withActivityContext } from "../../../mocks/utils.js";

const { Grid, Row, Column } = LayoutGrid;

const SIZE = { sm: 12, md: 12, lg: 6 } as LayoutGridProps.ColumnSize;

const NotificationsForm = withActivityContext(props => {
	const activities = useSelector(ActivitySelectors.activities());
	const activityChain = useMemo(
		() => selectActivityChain(activities, props.activityId),
		[activities, props.activityId]
	);

	const dispatch = useDispatch();
	const onCreateNotification = useCallback(() => {
		dispatch(
			SimpleFormActions.onEventTriggered({
				eventName: "create-notification",
				activityId: props.activityId
			})
		);
	}, [dispatch, props.activityId]);

	const onRemoveNotifications = useCallback(() => {
		dispatch(
			SimpleFormActions.onEventTriggered({
				eventName: "remove-notifications",
				activityId: props.activityId
			})
		);
	}, [dispatch, props.activityId]);

	const onCreateActivity = useCallback(() => {
		dispatch(
			SimpleFormActions.onEventTriggered({
				eventName: "create-activity",
				activityId: props.activityId
			})
		);
	}, [dispatch, props.activityId]);

	const isPermanent = useSingleDocumentValue("display_time")[0] === "permanent";

	return (
		<SimpleForm
			{...props}
			title="Notification Example"
			footer={{ rightButtons: [{ label: "Create Activity", onClick: onCreateActivity }] }}
		>
			<Grid>
				<Row>
					<Column size={SIZE}>
						<p>This form allows you to generate notifications.</p>
						<p>
							Using the field <code>Scope</code> you can specify whether the notification should be
							linked to an activity or exist globally (<code>Global</code>). In order for the field
							to contain more entries, it is necessary to create additional activities. You can do
							this using the <code>Create Activity</code> button below.
						</p>
						<p>
							<em>Note:</em> Changes to the form will set the activity as dirty and will trigger
							dirty handling on close (e.g. clicking in the main menu). To avoid this you can set
							the activity as non-dirty by pressing the <code>Create Notification</code> button.
						</p>
					</Column>
					<Column size={SIZE} spacerColumn />

					<Column size={SIZE}>
						<SelectInput
							items={createScopeItems(activityChain)}
							label="Scope*"
							path="scope"
							tooltips={
								<HintTooltip text="Select a scope in which the notification will live in." />
							}
						/>
					</Column>

					<Column size={SIZE}>
						<SelectInput
							items={["info", "success", "warning", "error"]}
							label="Severity*"
							path="severity"
						/>
					</Column>

					<Column size={SIZE}>
						<SelectInput
							items={["permanent", "temporary"]}
							label="Display time*"
							path="display_time"
						/>
					</Column>
					<Column size={SIZE} spacerColumn={isPermanent}>
						<NumberInput label="Duration*" path="duration" suffixes={<TextAffix>ms</TextAffix>} />
					</Column>

					<Column size={SIZE}>
						<SelectInput
							items={["top-right", "top-left", "bottom-right", "bottom-left"]}
							label="Position*"
							path="position"
						/>
					</Column>
					<Column size={SIZE}>
						<StringInput
							label="Icon"
							path="icon"
							addonAfter={
								<HintTooltip text="Name of the Material Icon. https://fonts.google.com/icons?selected=Material+Icons" />
							}
						/>
					</Column>

					<Column size={SIZE}>
						<StringInput label="Title" path="title" />
					</Column>
					<Column size={SIZE}>
						<StringInput label="Message" path="message" />
					</Column>

					<Column size={SIZE}>
						<ButtonGroup>
							<Button label="Create notification" onClick={onCreateNotification} />
							<Button
								label="Remove all notifications"
								destructive
								onClick={onRemoveNotifications}
							/>
						</ButtonGroup>
					</Column>
				</Row>
			</Grid>
		</SimpleForm>
	);
});

function selectActivityChain(activities: ActivityMap, activityId: string): string[] {
	const result = [];
	let activity = activities[activityId];
	while (activity !== undefined) {
		result.unshift(activity.id);
		activity =
			activity.initiatingActivityId !== undefined
				? activities[activity.initiatingActivityId]
				: undefined;
	}
	return result.slice(1);
}

function createScopeItems(activityIds: string[]): SelectItem[] {
	return activityIds.reduce<SelectItem[]>(
		(acc, cur, index) => [
			...acc,
			{
				value: `activity-${cur}`,
				label: "Parent ".repeat(activityIds.length - index - 1) + "Activity"
			}
			// Numbers create a sorting issue here. Therefore, we add a prefix that is later removed again
		],
		[{ value: "global", label: "Global" }]
	);
}

export default function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

const Views: { [name: string]: View.ViewComponent } = {
	NotificationsForm
};
