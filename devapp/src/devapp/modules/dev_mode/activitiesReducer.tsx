// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ComponentType } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { DynamicConfiguration, ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import {
	ActivitySelectors,
	ApplicationActions,
	DynamicGenericCaseMenu
} from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

import { DevAppActions } from "../../store/actions.js";

const ViewComponent1: ComponentType<ViewNGProps> = view => (
	<DebugView activityId={view.activityId} caze="case1" />
);

const ViewComponent2: ComponentType<ViewNGProps> = view => (
	<DebugView activityId={view.activityId} caze="case2" />
);

export const ActivityReducerModule: DynamicConfiguration = {
	id: "dev-mode.activities-reducer",
	menus: [
		{
			id: "dev-mode.activities-reducer",
			label: {
				key: "dev-mode.activities-reducer",
				defaults: {
					en: "Activities Reducer",
					de: "Aktivitäten Reducer"
				}
			},
			action: dispatch => {
				dispatch(
					ApplicationActions.startMainActivityRequested({
						descriptor: {
							section: "Development",
							feature: "ActivitiesReducer"
						}
					})
				);
			}
		}
	],
	flows: [
		{
			name: "dev-mode.activities-reducer",
			scenes: [
				{
					name: "dev-mode.activities-reducer",
					matches: descriptor =>
						descriptor.section === "Development" && descriptor.feature === "ActivitiesReducer",
					cases: [
						{
							name: "case1",
							label: {
								key: "case1",
								defaults: {
									en: "case1"
								}
							},
							sceneChange: {
								onEnter: [
									{
										type: "DYNAMIC_ADD_VIEW",
										component: ViewComponent1,
										region: "/CONTENT"
									}
								]
							}
						},
						{
							name: "case2",
							label: {
								key: "case2",
								defaults: {
									en: "case2"
								}
							},
							sceneChange: {
								onEnter: [
									{
										type: "DYNAMIC_ADD_VIEW",
										component: ViewComponent2,
										region: "/CONTENT"
									}
								]
							}
						}
					],
					defaultCase: "case1",
					sceneChange: {
						onEnter: [
							{
								type: "DYNAMIC_ADD_VIEW",
								component: DynamicGenericCaseMenu,
								region: "/SIDEBAR"
							}
						]
					}
				}
			]
		}
	]
};

interface DebugViewProps extends ViewNGProps {
	caze: string;
}

const DebugView: ComponentType<DebugViewProps> = view => {
	const { activityId, caze } = view;
	const data = useSelector(ActivitySelectors.data(activityId));
	const count = DevAppActions.isCounterData(data) ? data.count : 0;

	return (
		<ActionContentbox
			headingElements={<ContentBoxElements.Title text="Activities Reducer Example" />}
		>
			<p>
				This is a demonstration of a (custom) reducer for the <em>activities</em> slice. The custom
				reducer does two things.
			</p>
			<ul>
				<li>
					It toggles the activity <em>case</em>.
				</li>
				<li>It increments a generic counter (representing some custom logic).</li>
			</ul>
			<p>
				You are viewing <strong>{caze}</strong>.
			</p>
			{count > 0 && (
				<p>
					You have used the case button <strong>{count}</strong> times.
				</p>
			)}
			<ToggleCaseButton caze={caze} activityId={activityId} />
		</ActionContentbox>
	);
};

const ToggleCaseButton: ComponentType<DebugViewProps> = view => {
	const { activityId, caze } = view;
	const targetCase = caze === "case1" ? "case2" : "case1";

	const dispatch = useDispatch();

	return (
		<Button
			primary
			onClick={() =>
				dispatch(
					DevAppActions.setCase({
						activityId,
						caze: targetCase
					})
				)
			}
		>
			Activate {targetCase}
		</Button>
	);
};
