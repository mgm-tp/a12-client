// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { addPrefix } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/utils.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";
import { Icon } from "@com.mgmtp.a12.widgets/widgets-core/lib/icon/main/icon.view.js";
import { List } from "@com.mgmtp.a12.widgets/widgets-core/lib/list/main/list.view.js";
import { MessageBox } from "@com.mgmtp.a12.widgets/widgets-core/lib/message-box/main/message-box.view.js";

import type { SampleAppModule } from "../../../utils/SampleAppModule.js";

import { commitActivitySaga } from "./customCommit.js";
import { customCommitDataLoader } from "./customCommitDataLoader.js";
import { addNestedActivitySaga, nestedActivitySaga } from "./nestedActivitySaga.js";
import appModel from "./sagaOverride.appmodel.json" with { type: "json" };

const SagaOverrideModule: SampleAppModule = {
	id: "examples.saga-override",
	model: () => appModel as ApplicationModel,
	sagas: () => [nestedActivitySaga],
	views: () => viewProvider,
	dataLoaders: [customCommitDataLoader],
	applicationSagas: [commitActivitySaga]
};

export default SagaOverrideModule;

function viewProvider(componentName: string): View.ViewComponent | undefined {
	return ViewsMap[componentName];
}

function CustomCommit(props: View): JSX.Element {
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

function SagaOverride(props: View): JSX.Element {
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

const ViewsMap: { [name: string]: View.ViewComponent } = {
	CustomCommit,
	SagaOverride
};
