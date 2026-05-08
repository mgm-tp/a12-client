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

import type { JSX, ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { ButtonGroup } from "@com.mgmtp.a12.widgets/widgets-core/lib/button-group/main/button-group.view.js";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";
import { ButtonGroupContainer } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/button-group-container/main/button-group-container.view.js";

import type { SampleAppModule } from "../../utils/SampleAppModule.js";

import appmodel from "./master-detail.appmodel.json" with { type: "json" };

const MasterDetailModule: SampleAppModule = {
	id: "ui_handling.master-detail",
	model: () => appmodel as ApplicationModel,
	views: () => viewProvider
};

export default MasterDetailModule;

function MasterDetailDescription(props: View): JSX.Element {
	return (
		<MasterDetailWrapper {...props}>
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

function MasterDetailView(props: View): JSX.Element {
	return (
		<MasterDetailWrapper {...props}>
			<p>This is an example ui component to demonstrate the master detail layout.</p>
			<code>{JSON.stringify(props.constraints, undefined, 2)}</code>
		</MasterDetailWrapper>
	);
}

interface WrapperProps extends View {
	readonly constraints?: {
		readonly type?: string;
		readonly preferredWidth?: number;
	};
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

function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

const Views: { [name: string]: View.ViewComponent } = {
	MasterDetailDescription,
	MasterDetailView
};
