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
import { useContext } from "react";

import { FrameViews } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";

import { DescriptionPanel } from "./descriptionPanel.js";
import { SidebarContent } from "./subComponents.js";

export function MobileNavigationOverviewEngineSidebar(): JSX.Element {
	const sidebarContextProps = useContext(FrameViews.SidebarContext);

	return (
		<SidebarContent
			showDeviceInformation={true}
			content={
				<>
					<DescriptionPanel title="General description" open={true}>
						<>
							<p>
								This example shows when and how a back button is displayed when having views in the
								sidebar and content region, and using a MasterDetail layout for the content region.
							</p>
							<p>
								When starting the example one activity is created which adds a view to the sidebar
								region and one view to the content region.
							</p>
							<p>The sidebar region is shown initially, because it contains at least one view.</p>
						</>
					</DescriptionPanel>
					<DescriptionPanel title="Back button">
						<>
							<p>
								At the moment no back button is shown because there is no view before the current
								visible sidebar view.
							</p>

							<p>
								The Overview-Engine will display a back button in its ContentBox, which expands the
								sidebar.
							</p>
						</>
					</DescriptionPanel>
					<DescriptionPanel title="Title">
						<>
							<p>
								The back button in the Overview-Engine will be displayed next to the title of the
								ContentBox. It does not have to be set via the &quot;navigationBar&quot; prop of the
								ApplicationFrameLayout.
							</p>
						</>
					</DescriptionPanel>
					<p>
						This example shows when and how a back button is displayed when having views in the
						sidebar and content region, and using a MasterDetail layout for the content region.
					</p>
				</>
			}
			showContentButton={
				<Button
					onClick={() => sidebarContextProps?.setSubExpanded(false)}
					title="Collapse sidebar and show overview"
				>
					Show Overview
				</Button>
			}
		/>
	);
}

export function FormEngineSidebar(): JSX.Element {
	const sidebarContextProps = useContext(FrameViews.SidebarContext);
	return (
		<SidebarContent
			content={
				<>
					<DescriptionPanel title="General description" open={true}>
						<>
							<p>
								When opening the form another activity is created which clears the sidebar region
								and adds a view to it. It also adds another view to the content region.
							</p>
							<p>
								The sidebar is expanded again, because there is a new activity which contains a
								sidebar region with at least one view.
							</p>
						</>
					</DescriptionPanel>
					<DescriptionPanel title="Back button">
						<>
							<p>
								Because there are views before the current sidebar a back button is displayed. The
								back button cancels the current activity which brings the user back to the
								Overview-Engine.
							</p>
							<p>
								The Form-Engine will display a back button in its ContentBox, which expands the
								sidebar.
							</p>
						</>
					</DescriptionPanel>
					<DescriptionPanel title="Title">
						<>
							<p>
								The back button in the Form-Engine will be displayed next to the title of the
								ContentBox. It does not have to be set via the &quot;navigationBar&quot; prop of the
								ApplicationFrameLayout.
							</p>
						</>
					</DescriptionPanel>
				</>
			}
			showContentButton={
				<Button
					onClick={() => sidebarContextProps?.setSubExpanded(false)}
					title="Collapse sidebar and show form"
				>
					Show Form
				</Button>
			}
		/>
	);
}
