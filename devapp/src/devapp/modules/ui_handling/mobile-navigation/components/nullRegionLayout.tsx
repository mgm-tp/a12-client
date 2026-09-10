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
import { useContext } from "react";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { FrameViews } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

import { SidebarContent } from "./subComponents.js";

export function NullRegionSidebar(): JSX.Element {
	const sidebarContextProps = useContext(FrameViews.SidebarContext);
	return (
		<SidebarContent
			title="Null Region Sidebar"
			showDeviceInformation={true}
			content={
				<>
					<p>
						When starting this example an activity is created, which adds one view to the sidebar
						and three views to the content region.
					</p>
					<p>
						The sidebar is shown initially, because there is a new activity which contains a sidebar
						region with at least one view.
					</p>
				</>
			}
			showContentButton={
				<Button onClick={() => sidebarContextProps?.setSubExpanded(false)} title="Collapse sidebar">
					Show Content
				</Button>
			}
		/>
	);
}

export function NullRegionView(props: View): JSX.Element {
	function getDescription(): JSX.Element {
		return (
			<div>
				The null region layout shows all views below each other.
				<p>
					Because there are views in the sidebar a back-button is shown, which expands the sidebar.
				</p>
				<p>
					The back-button is shown in navigation bar because the layout shows multiple views at
					once.
				</p>
			</div>
		);
	}

	const title =
		props.constraints && isNullRegionViewConstraint(props.constraints)
			? props.constraints.title
			: "Dummy title";

	return (
		<ActionContentbox
			padding="24px"
			listenToNavigationContext
			headingElements={<ContentBoxElements.Title key="title" text={title} />}
		>
			{title === "View 1" ? getDescription() : null}
			View for activity with id: {props.activityId}
		</ActionContentbox>
	);
}

function isNullRegionViewConstraint(settings: object): settings is { title: string } {
	const { title } = settings as { title: string };

	if (typeof title === "string") {
		return true;
	}

	return false;
}
