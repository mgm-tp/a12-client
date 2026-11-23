// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
