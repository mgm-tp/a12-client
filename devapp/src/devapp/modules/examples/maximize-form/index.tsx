// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { Module, ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";
import { Icon } from "@com.mgmtp.a12.widgets/widgets-core/lib/icon/main/icon.view.js";
import { ModalOverlay } from "@com.mgmtp.a12.widgets/widgets-core/lib/modal-overlay/main/modal-overlay.view.js";

import { PersonForm } from "../../../mocks/SimpleForm/forms/person-form.js";
import { withActivityContext } from "../../../mocks/utils.js";

import appmodel from "./maximizeForm.appmodel.json" with { type: "json" };

const MaximizeFormModule: Module = {
	id: "examples.maximize-form",
	model: () => appmodel as ApplicationModel,
	views: () => name => ViewsMap[name]
};

export default MaximizeFormModule;

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
	instance: "__NEW__",
	model: "Person-document"
};

function MaximizeOverview(props: View): JSX.Element {
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

const ViewsMap: { [name: string]: View.ViewComponent } = {
	MaximizeOverview,
	MaximizeFormView
};
