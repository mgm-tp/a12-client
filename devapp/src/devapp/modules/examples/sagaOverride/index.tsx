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
import type { Dispatch } from "redux";

import type {
	Activity,
	DynamicFlow,
	DynamicMenu,
	ViewNGProps
} from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	ApplicationActions
} from "@com.mgmtp.a12.client/client-core";
import {
	Button,
	addPrefix,
	ActionContentbox,
	ContentBoxElements,
	Icon,
	List,
	MessageBox
} from "@com.mgmtp.a12.widgets/widgets-core";

import type { SampleAppModule } from "../../../utils/SampleAppModule.js";

import { commitActivitySaga } from "./customCommit.js";
import { customCommitDataLoader } from "./customCommitDataLoader.js";
import { addNestedActivitySaga, nestedActivitySaga } from "./nestedActivitySaga.js";

const INITIAL_DESCRIPTOR = { section: "Examples", example: "SagaOverride" };

function CustomCommit(props: ViewNGProps): JSX.Element {
	const dispatch = useDispatch();

	const error = useSelector(ActivitySelectors.error(props.activityId));

	const loadingState = useSelector(ActivitySelectors.loadingStateById(props.activityId));
	const savingState = useSelector(ActivitySelectors.savingStateById(props.activityId));
	const data = useSelector(ActivitySelectors.data(props.activityId));
	const initiatingActivityId = useSelector(
		ActivitySelectors.activityPropById(props.activityId, a => a.initiatingActivityId)
	);

	const datasourceActivityId = useSelector(
		ActivitySelectors.datasourceActivityId(props.activityId)
	);
	return (
		<ActionContentbox
			listenToNavigationContext
			headingElements={
				<ContentBoxElements.Title
					key="title"
					text="Commit Saga Override"
					ariaLevel={props.ariaLevel}
				/>
			}
			notificationArea={savingState === "error" && error && NotificationArea(error.errorCode)}
		>
			<List divider className={addPrefix("-u-margin-b-sm")}>
				<List.Item text="Activity" secondaryText={props.activityId} readonly flipped />
				<List.Item
					text="Initiating Activity"
					secondaryText={initiatingActivityId}
					readonly
					flipped
				/>
				<List.Item
					text="Data Source Activity"
					secondaryText={datasourceActivityId}
					readonly
					flipped
				/>
				<List.Item text="Loading state" secondaryText={loadingState} readonly flipped />
				<List.Item text="Saving state" secondaryText={savingState} readonly flipped />
				<List.Item text="document" secondaryText={data && JSON.stringify(data)} readonly flipped />
			</List>
			<h3>*Custom* Commit</h3>
			<p>Click the button below to trigger the custom commit.</p>
			<p>
				The custom commit will write back to the server as well as update the parent activity in
				sequence.
			</p>
			<p>To demonstrate error handling, only every second commit will succeed.</p>
			<Button
				primary
				destructive
				onClick={() => dispatch(ActivityActions.commit.started({ activityId: props.activityId }))}
				label="Commit Data"
			/>
		</ActionContentbox>
	);
}

function NotificationArea(errorText: string): JSX.Element {
	return <MessageBox icon={<Icon iconTheme="custom">error</Icon>} label={errorText} />;
}

function SagaOverview(props: ViewNGProps): JSX.Element {
	const dispatch = useDispatch();
	const loadingState = useSelector(ActivitySelectors.loadingStateById(props.activityId));
	const savingState = useSelector(ActivitySelectors.savingStateById(props.activityId));
	const data = useSelector(ActivitySelectors.data(props.activityId));

	const nestedActivity = useSelector(ActivitySelectors.childActivityWithInstance(props.activityId));

	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title
					key="title"
					text="Application Saga Override"
					ariaLevel={props.ariaLevel}
				/>
			}
		>
			<List divider className={addPrefix("-u-margin-b-sm")}>
				<List.Item text="Activity" secondaryText={props.activityId} readonly flipped />
				<List.Item text="Loading state" secondaryText={loadingState} readonly flipped />
				<List.Item text="Saving state" secondaryText={savingState} readonly flipped />
				<List.Item text="document" secondaryText={data && JSON.stringify(data)} readonly flipped />
			</List>
			<h3>Overriding the default commit saga</h3>
			<p>
				Click the button below to create a nested activity that will be linked to this initial
				activity.
			</p>
			<p>Within that nested activity you can then try to commit the sample data.</p>
			<Button
				primary
				destructive
				disabled={nestedActivity !== undefined}
				onClick={() => dispatch(addNestedActivitySaga({ activityId: props.activityId }))}
				label="Add nested activity"
			/>
		</ActionContentbox>
	);
}

function matchesOverview(d: Activity.Descriptor): boolean {
	return d.section === "Examples" && d.example === "SagaOverride" && !d.instance;
}

function matchesDetail(d: Activity.Descriptor): boolean {
	return !!d.instance;
}

const dynamicFlows: DynamicFlow[] = [
	{
		name: "examples.saga-override",
		scenes: [
			{
				name: "SagaOverride",
				matches: matchesOverview,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: SagaOverview,
							region: "/CONTENT"
						}
					]
				}
			},
			{
				name: "SagaOverrideDetail",
				priorScene: "SagaOverride",
				matches: matchesDetail,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: CustomCommit,
							region: "/CONTENT"
						}
					]
				}
			}
		]
	}
];

function onMenuClick(dispatch: Dispatch): void {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: INITIAL_DESCRIPTOR,
				loadingState: "without"
			}),
			descriptor: {}
		})
	);
}

function selectMenus(state: object): DynamicMenu[] {
	const activities = ActivitySelectors.activitiesByDescriptor(INITIAL_DESCRIPTOR)(state);
	return [
		{
			id: "examples.saga-override",
			label: {
				key: "examples.saga-override",
				defaults: { en: "Saga Override", de: "Saga überschreiben" }
			},
			action: onMenuClick,
			selected: activities.at(0) !== undefined
		}
	];
}

export const SagaOverrideModule: SampleAppModule = {
	id: "examples.saga-override",
	flows: dynamicFlows,
	menus: selectMenus,
	sagas: () => [nestedActivitySaga],
	dataLoaders: [customCommitDataLoader],
	applicationSagas: [commitActivitySaga]
};
