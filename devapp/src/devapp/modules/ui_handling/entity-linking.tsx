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

import type { ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ActivityMap, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements as CBE } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

import type { SampleAppModule } from "../../utils/SampleAppModule.js";

import appmodel from "./entity-linking.appmodel.json" with { type: "json" };

const EntityLinkingModule: SampleAppModule = {
	id: "ui_handling.entity-linking",
	model: () => appmodel as ApplicationModel,
	views: () => viewProvider
};

export default EntityLinkingModule;

function Overview(props: View): JSX.Element {
	const dispatch = useDispatch();

	const descriptor = useSelector(
		ActivitySelectors.activityPropById(props.activityId, a => a.descriptor)
	);

	const activities = useSelector(ActivitySelectors.activities());
	const child = ActivityMap.toList(activities).find(
		activity => activity.initiatingActivityId === props.activityId
	);

	return (
		<ActionContentbox
			headingElements={<CBE.Title text="Deep (Entity) Linking" ariaLevel={props.ariaLevel} />}
		>
			<p>
				Reload the page using your browser controls or copy &amp; paste the URL into a new tab. You
				should see this page again.
			</p>

			<p>
				Click{" "}
				<Button
					label="this button"
					primary
					onClick={() =>
						dispatch(
							ActivityActions.create({
								activityDescriptor: {
									...descriptor,
									detail: "true"
								},
								initiatingActivityId: props.activityId,
								loadingState: "without"
							})
						)
					}
					disabled={child !== undefined}
				/>{" "}
				to start a new activity. Then reload the page again. You should see a different page, only
				showing the second view.
			</p>
		</ActionContentbox>
	);
}

function Detail(props: View): JSX.Element {
	const dispatch = useDispatch();

	return (
		<ActionContentbox
			padding="24px"
			headingElements={
				<CBE.Title text="Deep (Entity) Linking - Detail View" ariaLevel={props.ariaLevel} />
			}
		>
			<p>If you have reloaded the page, then you should see only this view.</p>
			<p>
				<Button
					label="close"
					primary
					onClick={() =>
						dispatch(
							ActivityActions.cancel({
								activityId: props.activityId
							})
						)
					}
				/>
			</p>
		</ActionContentbox>
	);
}

function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

const Views: { [name: string]: View.ViewComponent } = {
	"EntityLinking.Overview": Overview,
	"EntityLinking.Detail": Detail
};
