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

import type { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import {
	Activity,
	ActivityActions,
	ActivityMap,
	ActivitySelectors
} from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { addPrefix } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/utils.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

import { cancelActivities, setDirty } from "./dirtyHandlingFeatureActions.js";
import { DESCRIPTOR } from "./sagas.js";

function selectActivities(state: object) {
	return ActivityMap.toList(ActivitySelectors.activities()(state)).filter(
		a => a.descriptor.detail === "true"
	);
}

function DirtyHandling(props: View): JSX.Element {
	const dispatch = useDispatch();
	const stateActivityList = useSelector(selectActivities);
	const activityOptions: {
		[key: string]: {
			activity?: Activity;
			enableCreateNew?: boolean;
			parentActivityId?: string;
		};
	} = {
		A: {
			activity: stateActivityList.find(a => a.id === "A"),
			enableCreateNew: true,
			parentActivityId: props.activityId
		},
		B: {
			activity: stateActivityList.find(a => a.id === "B"),
			enableCreateNew: true,
			parentActivityId: props.activityId
		},
		B1: {
			activity: stateActivityList.find(a => a.id === "B1"),
			parentActivityId: "B"
		},
		B2: {
			activity: stateActivityList.find(a => a.id === "B2"),
			parentActivityId: "B"
		},
		C: {
			activity: stateActivityList.find(a => a.id === "C"),
			enableCreateNew: true,
			parentActivityId: props.activityId
		}
	};

	activityOptions["B1"].enableCreateNew = activityOptions["B"].activity !== undefined;
	activityOptions["B2"].enableCreateNew = activityOptions["B"].activity !== undefined;

	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title key="title" text="Dirty Handling" ariaLevel={props.ariaLevel} />
			}
		>
			<div>
				<p>Below you can see a list of activities.</p>
				<p>For each activity you can change the dirty state. </p>
				<p>
					When you toggle the dirty state of Activity
					<i>A</i>, <i>B</i>, <i>B1</i> or <i>B2</i> the normal setDirty action will be dispatched
					<br></br>
					This action will set the dirty state of the activity data holder.
					<br></br>
					Activity <i>C</i> contains two data holders, if you toggle the dirty state here, the
					second data holder (not the activity data holder) will be set to dirty.
				</p>
				<p>
					If you try to cancel an activity, the dirty state of the activity and all children will be
					evaluated.
					<br></br>
					An activity is dirty if any of its data holders is dirty.
				</p>
				<p>If any of these activities is dirty, a cancel confirmation dialog will be shown.</p>
				<div>
					{Object.keys(activityOptions).map(key => {
						const option = activityOptions[key];
						return (
							<ActivityContainer
								key={key}
								activityId={key}
								parentActivityId={option.parentActivityId}
								showCreateNewActivity={option.enableCreateNew}
							/>
						);
					})}
				</div>
				<div className={addPrefix("-u-margin-b-xl")}>
					<Button
						primary
						destructive
						onClick={() =>
							dispatch(
								cancelActivities({
									activityIds: stateActivityList.map(activity => activity.id)
								})
							)
						}
						label="Cancel all"
						disabled={stateActivityList.length === 0}
					/>
				</div>
			</div>
		</ActionContentbox>
	);
}

function ActivityContainer(props: {
	activityId: string;
	parentActivityId?: string;
	showCreateNewActivity?: boolean;
}): JSX.Element {
	const dispatch = useDispatch();
	const dataHolders = useSelector(
		ActivitySelectors.activityPropById(props.activityId, a => a.dataHolders)
	);

	const exists = useSelector(ActivitySelectors.activityPropById(props.activityId, a => !!a));
	const initiatingActivityId = useSelector(
		ActivitySelectors.activityPropById(props.activityId, a => a.initiatingActivityId)
	);

	const defaultDH = useSelector(
		ActivitySelectors.activityPropById(props.activityId, Activity.findDefaultDataHolder)
	);

	return (
		<div key={props.activityId} className={addPrefix("-u-margin-b-xl")}>
			<h1>Activity: {props.activityId}</h1>
			{exists ? (
				<ul>
					{initiatingActivityId ? <li>Parent: {initiatingActivityId}</li> : ""}
					{dataHolders?.map(({ dirty }, index) => (
						<li key={index}>
							<div>
								Data Holder {index + 1} dirty? {dirty ? "true" : "false"}
							</div>
						</li>
					))}
				</ul>
			) : (
				<ul>
					<li>Activity is not in the store at the moment</li>
				</ul>
			)}
			{exists ? (
				<>
					<div className={addPrefix("-u-inline-block -u-margin-r-sm")}>
						<div>
							<Button
								onClick={() => {
									if (props.activityId === "C") {
										dispatch(
											setDirty({
												activityId: props.activityId,
												dirty: !defaultDH?.dirty
											})
										);
									} else {
										dispatch(
											ActivityActions.setDirty({
												activityId: props.activityId,
												dirty: !defaultDH?.dirty
											})
										);
									}
								}}
								label="Toggle Dirty"
							/>
						</div>
					</div>
					<div className={addPrefix("-u-inline-block -u-margin-r-sm")}>
						<Button
							primary
							destructive
							onClick={() => dispatch(cancelActivities({ activityIds: [props.activityId] }))}
							label="Cancel"
						/>
					</div>
				</>
			) : props.showCreateNewActivity ? (
				<div className={addPrefix("-u-inline-block -u-margin-r-sm")}>
					<Button
						primary
						destructive
						onClick={() =>
							dispatch(
								ActivityActions.create({
									activityDescriptor: DESCRIPTOR,
									activityId: props.activityId,
									initiatingActivityId: props.parentActivityId,
									loadingState: "without"
								})
							)
						}
						label="Create New"
					/>
				</div>
			) : (
				<></>
			)}
		</div>
	);
}

export default function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

const Views: { [name: string]: View.ViewComponent } = {
	DirtyHandling
};
