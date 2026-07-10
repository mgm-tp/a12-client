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
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import type {
	Activity,
	DynamicConfiguration,
	DynamicMatchCondition,
	DynamicMenu,
	ViewNGProps
} from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	ApplicationActions,
	DynamicRegionUi
} from "@com.mgmtp.a12.client/client-core";
import {
	ButtonGroup,
	Button,
	ActionContentbox,
	ContentBoxElements
} from "@com.mgmtp.a12.widgets/widgets-core";

import { memoize } from "../../../3rd-party-licenses/memoize.js";

import { CustomModalLayout } from "./modal-layout.js";

export const CustomRegionModule: DynamicConfiguration = {
	id: "ui_handling.custom-region",
	regions: [{ name: "GLOBAL", layout: CustomModalLayout }],
	flows(state) {
		return [
			{
				name: `ui_handling.custom-region.flow`,
				scenes: selectRelevantActivities(state).map(({ descriptor, id }) => {
					const { modal, variant } = descriptor;

					return {
						name: `ui_handling.custom-region.scene.${id}`,
						matches: createMemoizedMatcher(modal, variant),
						sceneChange: {
							onEnter: [
								{
									type: "DYNAMIC_ADD_VIEW",
									component: CustomRegion,
									region: modal === "true" ? "GLOBAL" : "/CONTENT",
									constraints:
										variant === "custom_size"
											? { width: 400, height: 600 }
											: variant === "fullscreen"
												? { fullscreen: true }
												: undefined
								}
							]
						}
					};
				})
			}
		];
	},
	menus(state) {
		const selected = selectRelevantActivities(state).length > 0;

		return createMemoizedMenu(selected);
	}
};

const createMemoizedMenu = memoize((selected: boolean) => [
	{
		id: `ui_handling.custom-region.dynamicMenu`,
		label: { key: "examples.ui-handling.customRegion.menuEntry" },
		selected,
		action: dispatch => {
			dispatch(
				ApplicationActions.startMainActivityRequested({
					action: ActivityActions.create({
						activityDescriptor: {
							section: "UiHandling",
							feature: "CustomRegion"
						},
						loadingState: "without"
					}),
					descriptor: {}
				})
			);
		}
	} satisfies DynamicMenu
]);

const createMemoizedMatcher = memoize(
	(modal?: string, variant?: string) => {
		const matcher: DynamicMatchCondition = descriptor =>
			descriptor.section === "UiHandling" &&
			descriptor.feature === "CustomRegion" &&
			descriptor.modal === modal &&
			descriptor.variant === variant;

		return matcher;
	},
	(m, v) => `${m}${v}`
);

function selectRelevantActivities(state: object): Activity[] {
	return Object.values(ActivitySelectors.activities()(state)).flatMap(a =>
		a?.descriptor.section === "UiHandling" && a.descriptor.feature === "CustomRegion" ? a : []
	);
}

function CustomRegion(props: ViewNGProps): JSX.Element {
	const dispatch = useDispatch();

	const descriptor = useSelector(
		ActivitySelectors.activityPropById(props.activityId, a => a.descriptor)
	);

	const onStartClick = useCallback(
		(variant: string) => () =>
			dispatch(
				ActivityActions.create({
					activityDescriptor: {
						...descriptor,
						modal: "true",
						variant
					},
					initiatingActivityId: props.activityId,
					loadingState: "without"
				})
			),
		[descriptor, dispatch, props.activityId]
	);

	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title text="Custom Region Example" ariaLevel={props.ariaLevel} />
			}
			footer={
				<ContentBoxElements.Footer>
					<ButtonGroup alignment="right">
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
							cancel this activity
						</Button>
					</ButtonGroup>
				</ContentBoxElements.Footer>
			}
		>
			<p>
				This is an example of a custom Region. It is used to display modal dialogs in a different
				way than the standard Modal Region.
			</p>
			<p>
				It renders the modals in a (custom) layout, instead of the Modal Region UI. This allows to
				render one modal per view, as well as to configure the display of views using layout
				constraints.
			</p>
			<p>Use the buttons to start a new or to cancel the current activity.</p>
			<ButtonGroup>
				<Button onClick={onStartClick("default")}>default modal</Button>
				<Button onClick={onStartClick("custom_size")}>custom size</Button>
				<Button onClick={onStartClick("fullscreen")}>fullscreen</Button>
			</ButtonGroup>
			<p>This is activity {props.activityId}.</p>
			{descriptor?.modal !== "true" && <DynamicRegionUi regionRef="GLOBAL" />}
		</ActionContentbox>
	);
}
