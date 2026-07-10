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

import type { JSX, ReactNode } from "react";
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
	ContentBoxElements,
	ButtonGroupContainer
} from "@com.mgmtp.a12.widgets/widgets-core";

const INITIAL_DESCRIPTOR = { section: "UIHandling", feature: "MasterDetailEntry" };

function matchesEntry(descriptor: Activity.Descriptor): boolean {
	return (
		descriptor.section === "UIHandling" &&
		descriptor.feature === "MasterDetailEntry" &&
		!descriptor.instance
	);
}

function matchesNext(descriptor: Activity.Descriptor): boolean {
	return !!descriptor.instance;
}

function matchesAlways(): boolean {
	return true;
}

function MasterDetailDescriptionView(props: ViewNGProps): JSX.Element {
	return (
		<MasterDetailWrapper constraints={{ type: "MasterDetail" }} {...props}>
			<p>
				This is an example ui component to demonstrate the configuration of the master detail
				layout.
			</p>
			<p>Currently, only the preferred width is configurable.</p>
			<p>
				If two ui components are shown then the preferred width of the view on the right hand side
				is taken into account. The other view on the left hand side takes up the remaining space.
			</p>
		</MasterDetailWrapper>
	);
}

function createMasterDetailView(viewConstraints: MasterDetailConstraints) {
	return function MasterDetailView(props: ViewNGProps): JSX.Element {
		return (
			<MasterDetailWrapper constraints={viewConstraints} {...props}>
				<p>This is an example ui component to demonstrate the master detail layout.</p>
				<code>{JSON.stringify(viewConstraints, undefined, 2)}</code>
			</MasterDetailWrapper>
		);
	};
}

const MasterDetailViewWidth8 = createMasterDetailView({
	type: "MasterDetail",
	preferredWidth: 8
});
const MasterDetailViewWidth10 = createMasterDetailView({
	type: "MasterDetail",
	preferredWidth: 10
});
const MasterDetailViewWidth4 = createMasterDetailView({
	type: "MasterDetail",
	preferredWidth: 4
});

const dynamicFlows: DynamicFlow[] = [
	{
		name: "ui_handling.master-detail",
		scenes: [
			{
				name: "MasterDetailEntry",
				matches: matchesEntry,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: MasterDetailDescriptionView,
							region: "/CONTENT",
							constraints: { type: "MasterDetail" }
						}
					]
				}
			},
			{
				name: "MasterDetailNext1",
				priorScene: "MasterDetailEntry",
				matches: matchesNext,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: MasterDetailViewWidth8,
							region: "/CONTENT",
							constraints: { type: "MasterDetail", preferredWidth: 8 }
						}
					]
				}
			},
			{
				name: "MasterDetailNext2",
				priorScene: "MasterDetailNext1",
				matches: matchesAlways,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: MasterDetailViewWidth10,
							region: "/CONTENT",
							constraints: { type: "MasterDetail", preferredWidth: 10 }
						}
					],
					onExit: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: MasterDetailViewWidth10,
							region: "/CONTENT",
							constraints: { type: "MasterDetail", preferredWidth: 10 }
						}
					]
				}
			},
			{
				name: "MasterDetailNext3",
				priorScene: "MasterDetailNext2",
				matches: matchesAlways,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: MasterDetailViewWidth4,
							region: "/CONTENT",
							constraints: { type: "MasterDetail", preferredWidth: 4 }
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
			id: "ui_handling.master-detail",
			label: {
				key: "ui_handling.master-detail",
				defaults: { en: "Master Detail Layout", de: "Master Detail Layout" }
			},
			action: onMenuClick,
			selected: activities.at(0) !== undefined
		}
	];
}

export const MasterDetailModule: DynamicConfiguration = {
	id: "ui_handling.master-detail",
	flows: dynamicFlows,
	menus: selectMenus
};

interface MasterDetailConstraints {
	readonly type?: string;
	readonly preferredWidth?: number;
}

interface WrapperProps extends ViewNGProps {
	readonly constraints?: MasterDetailConstraints;
	readonly children?: ReactNode;
}

function MasterDetailWrapper({
	constraints,
	activityId,
	children,
	ariaLevel
}: WrapperProps): JSX.Element {
	const last = constraints && constraints.preferredWidth === 4;
	const dispatch = useDispatch();

	const initiatingActivityId = useSelector(
		ActivitySelectors.activityPropById(activityId, a => a.initiatingActivityId)
	);
	const descriptor = useSelector(ActivitySelectors.activityPropById(activityId, a => a.descriptor));

	return (
		<ActionContentbox
			listenToNavigationContext
			headingElements={
				<ContentBoxElements.Title text="Master Detail Example" ariaLevel={ariaLevel} />
			}
			footer={
				<ContentBoxElements.Footer>
					<ButtonGroupContainer>
						<ButtonGroup alignment="right">
							{initiatingActivityId !== undefined ? (
								<Button
									destructive
									onClick={() => {
										dispatch(ActivityActions.cancelRequested({ activityIds: [activityId] }));
									}}
									label="Close"
								/>
							) : null}
							{!last ? (
								<Button
									primary
									onClick={() => {
										dispatch(
											ActivityActions.create({
												activityDescriptor: {
													...descriptor,
													instance: Math.round(Math.random() * 1000).toString()
												},
												loadingState: "without",
												initiatingActivityId: activityId
											})
										);
									}}
									label="Next"
								/>
							) : null}
						</ButtonGroup>
					</ButtonGroupContainer>
				</ContentBoxElements.Footer>
			}
		>
			{children}
		</ActionContentbox>
	);
}
