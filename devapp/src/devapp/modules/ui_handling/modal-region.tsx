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
	DynamicConfiguration,
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
	ButtonGroup,
	Button,
	ActionContentbox,
	ContentBoxElements
} from "@com.mgmtp.a12.widgets/widgets-core";

const INITIAL_DESCRIPTOR = { section: "UIHandling", feature: "ModalRegion" };

function matchesContent(descriptor: Activity.Descriptor): boolean {
	return (
		descriptor.section === "UIHandling" && descriptor.feature === "ModalRegion" && !descriptor.modal
	);
}

function matchesModal(descriptor: Activity.Descriptor): boolean {
	return (
		descriptor.section === "UIHandling" &&
		descriptor.feature === "ModalRegion" &&
		descriptor.modal === "true"
	);
}

const dynamicFlows: DynamicFlow[] = [
	{
		name: "ui_handling.modal-region",
		scenes: [
			{
				name: "ModalRegion",
				matches: matchesContent,
				sceneChange: {
					onEnter: [
						{ type: "DYNAMIC_CLEAR_REGION", region: "/CONTENT" },
						{ type: "DYNAMIC_ADD_VIEW", component: ModalRegion, region: "/CONTENT" }
					]
				}
			},
			{
				name: "ModalRegionModal",
				matches: matchesModal,
				sceneChange: {
					onEnter: [{ type: "DYNAMIC_ADD_VIEW", component: ModalRegion, region: "/MODAL" }]
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
			id: "ui_handling.modal-region",
			label: {
				key: "ui_handling.modal-region",
				defaults: { en: "Modal Region", de: "Modal Region" }
			},
			action: onMenuClick,
			selected: activities.at(0) !== undefined
		}
	];
}

export const ModalRegionModule: DynamicConfiguration = {
	id: "ui_handling.modal-region",
	flows: dynamicFlows,
	menus: selectMenus
};

function ModalRegion(props: ViewNGProps): JSX.Element {
	const descriptor = useSelector(
		ActivitySelectors.activityPropById(props.activityId, a => a.descriptor)
	);
	const initiatingActivityId = useSelector(
		ActivitySelectors.activityPropById(props.activityId, a => a.initiatingActivityId)
	);
	const dispatch = useDispatch();

	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title text="Modal Region Example" ariaLevel={props.ariaLevel} />
			}
			footer={
				<ContentBoxElements.Footer>
					<ButtonGroup alignment="right">
						{initiatingActivityId && (
							<Button
								destructive
								onClick={() =>
									dispatch(
										ActivityActions.cancelRequested({
											activityIds: [props.activityId]
										})
									)
								}
							>
								cancel nested activity
							</Button>
						)}
						<Button
							primary
							onClick={() =>
								dispatch(
									ActivityActions.create({
										activityDescriptor: {
											...descriptor,
											modal: "true"
										},
										initiatingActivityId: props.activityId,
										loadingState: "without"
									})
								)
							}
						>
							start nested activity
						</Button>
					</ButtonGroup>
				</ContentBoxElements.Footer>
			}
		>
			<p>
				This is an example usage of the <code>MODAL</code> Region. The <code>MODAL</code> Region is
				a feature of the built-in / standard <code>ApplicationFrameLayout</code>.
			</p>
			<p>
				In combination with the <code>StackLayout</code>, you can also handle nested activities
				inside the <code>MODAL</code> Region.
			</p>
			<p>
				Use the buttons at the bottom to start an Activity in the <code>MODAL</code> Region or to
				cancel a nested Activity.
			</p>
			<p>This is activity {props.activityId}.</p>
		</ActionContentbox>
	);
}
