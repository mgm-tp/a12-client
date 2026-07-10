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
import { useCallback, useState } from "react";
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
	ApplicationActions,
	NEW_INSTANCE_IDENTIFIER
} from "@com.mgmtp.a12.client/client-core";
import {
	Button,
	ActionContentbox,
	ContentBoxElements,
	Icon,
	ModalOverlay
} from "@com.mgmtp.a12.widgets/widgets-core";

import { PersonForm } from "../../../mocks/SimpleForm/forms/person-form.js";
import { withActivityContext } from "../../../mocks/utils.js";

const INITIAL_DESCRIPTOR = { section: "Examples", example: "MaximizeForm" };

const MaximizeFormView = withActivityContext(props => {
	const [maximized, setMaximized] = useState(true);

	const contentbox = (
		<PersonForm
			{...props}
			headingButtons={
				<Button
					invert
					onClick={() => setMaximized(!maximized)}
					icon={<Icon>{maximized ? "fullscreen_exit" : "fullscreen"}</Icon>}
				/>
			}
		/>
	);

	return maximized ? (
		<ModalOverlay fullscreen closeOnEsc closeOnOutsideClick onClose={() => setMaximized(false)}>
			{contentbox}
		</ModalOverlay>
	) : (
		contentbox
	);
});

const childActivityDescriptor = {
	section: "Examples",
	example: "MaximizeForm",
	instance: NEW_INSTANCE_IDENTIFIER,
	model: "Person-document"
};

function MaximizeOverview(props: ViewNGProps): JSX.Element {
	const activeChildActivities = useSelector(
		ActivitySelectors.activitiesByDescriptor(childActivityDescriptor)
	);

	const dispatch = useDispatch();
	const onOpenForm = useCallback(() => {
		if (activeChildActivities.length > 0) {
			for (const activity of activeChildActivities) {
				dispatch(ActivityActions.cancel({ activityId: activity.id }));
			}
		}

		dispatch(
			ActivityActions.create({
				activityDescriptor: childActivityDescriptor,
				initiatingActivityId: props.activityId
			})
		);
	}, [activeChildActivities, dispatch, props.activityId]);

	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title key="title" text="Custom Maximize" ariaLevel={props.ariaLevel} />
			}
		>
			<p>
				This is an example of how to implement a custom &quot;maximize/restore&quot; behavior for a
				view.
			</p>
			<p>
				The custom view uses the ModalOverlay widget to render the form on top of the normal UI.
			</p>
			<Button primary label={"Open maximizable form"} onClick={onOpenForm} />
		</ActionContentbox>
	);
}

function matchesIntro(d: Activity.Descriptor): boolean {
	return d.section === "Examples" && d.example === "MaximizeForm" && !d.instance;
}

function matchesForm(d: Activity.Descriptor): boolean {
	return d.section === "Examples" && d.example === "MaximizeForm" && !!d.instance;
}

const dynamicFlows: DynamicFlow[] = [
	{
		name: "examples.maximize-form",
		scenes: [
			{
				name: "MaximizeFormExampleIntro",
				matches: matchesIntro,
				sceneChange: {
					onEnter: [
						{ type: "DYNAMIC_CLEAR_REGION", region: "/CONTENT" },
						{
							type: "DYNAMIC_ADD_VIEW",
							component: MaximizeOverview,
							region: "/CONTENT"
						}
					]
				}
			},
			{
				name: "MaximizeFormExample",
				priorScene: "MaximizeFormExampleIntro",
				matches: matchesForm,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: MaximizeFormView,
							region: "/CONTENT",
							models: [{ modelType: "document", name: "Person-document" }]
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
			id: "examples.maximize-form",
			label: {
				key: "examples.maximize-form",
				defaults: { en: "Maximize Form View", de: "Form View Maximieren" }
			},
			action: onMenuClick,
			selected: activities.at(0) !== undefined
		}
	];
}

export const MaximizeFormModule: DynamicConfiguration = {
	id: "examples.maximize-form",
	flows: dynamicFlows,
	menus: selectMenus
};
