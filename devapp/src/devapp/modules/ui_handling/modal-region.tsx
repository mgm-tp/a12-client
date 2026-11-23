// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { ButtonGroup } from "@com.mgmtp.a12.widgets/widgets-core/lib/button-group/main/button-group.view.js";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

import type { SampleAppModule } from "../../utils/SampleAppModule.js";

import appmodel from "./modal-region.appmodel.json" with { type: "json" };

const ModalRegionModule: SampleAppModule = {
	id: "ui_handling.modal-region",
	model: () => appmodel as ApplicationModel,
	views: () => viewProvider
};

export default ModalRegionModule;

function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

function ModalRegion(props: View): JSX.Element {
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

const Views: { [name: string]: View.ViewComponent } = {
	ModalRegion
};
