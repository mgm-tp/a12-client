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
import { useDispatch } from "react-redux";

import type { ViewNGComponent, ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, FrameViews } from "@com.mgmtp.a12.client/client-core";
import {
	Button,
	addPrefix,
	ActionContentbox,
	ContentBoxElements,
	LayoutGrid
} from "@com.mgmtp.a12.widgets/widgets-core";

import { DescriptionPanel } from "./descriptionPanel.js";
import type { TitledViewProps } from "./subComponents.js";
import { ShowDeviceInformation, SidebarContent } from "./subComponents.js";

export function StartDashboard(props: ViewNGProps): JSX.Element {
	const dispatch = useDispatch();
	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title key="title" text="Mobile Navigation Dashboard Layout Example" />
			}
		>
			<>
				<p>
					This example shows when and how a back button is displayed when having views in the
					sidebar and content region, and using a Dashboard layout for the content region.
				</p>
				<p>
					When starting the example one activity is created which adds a view to the content region.
				</p>
				<p>Because there is no view in the sidebar at the moment, the content region is shown.</p>
				<p>
					When clicking &quot;Start Dashboard for document 1&quot; or &quot;Start Dashboard for
					document 2&quot; one activity for the respective dashboard will be started. This activity
					then starts sub-activities for the different tiles of the dashboard. Each tile adds a view
					to the content region. One tile adds also a view to the sidebar region.
				</p>
			</>
			<Button
				onClick={() =>
					dispatch(
						ActivityActions.create({
							activityDescriptor: {
								section: "UIHandling",
								feature: "DashboardLayout",
								scene: "Dashboard",
								instance: "1",
								model: "Person-document"
							},
							initiatingActivityId: props.activityId,
							loadingState: "without"
						})
					)
				}
			>
				Start Dashboard for document 1
			</Button>
			<Button
				onClick={() =>
					dispatch(
						ActivityActions.create({
							activityDescriptor: {
								section: "UIHandling",
								feature: "DashboardLayout",
								scene: "Dashboard",
								instance: "2",
								model: "Person-document"
							},
							initiatingActivityId: props.activityId,
							loadingState: "without"
						})
					)
				}
			>
				Start Dashboard for document 2
			</Button>
			<br />
			<ShowDeviceInformation />
		</ActionContentbox>
	);
}

export function MobileNavigationDashboardSidebar(): JSX.Element {
	const sidebarContextProps = useContext(FrameViews.SidebarContext);

	return (
		<SidebarContent
			content={
				<LayoutGrid.Grid className={addPrefix("-u-margin-t-md")}>
					<DescriptionPanel title="General description" open>
						<>
							<p>
								When starting the dashboard an activity is created, which creates three
								sub-activities. Each of the sub-activities adds a view to the content. One
								sub-activity also adds a view to the sidebar.
							</p>
							<p>
								The sidebar is shown initially, because there is a new activity which contains a
								sidebar region with at least one view.
							</p>
						</>
					</DescriptionPanel>
					<DescriptionPanel title="Back button">
						<>
							<p>
								Because there is a view before the current sidebar a back button is displayed. The
								back button brings the user back to the introduction view. To archive this it
								cancels all activities belonging to a tile view. It also cancels the initial
								dashboard activity, because this one does not belong to a view and after cancelling
								the tile views it is not a parent of any view activity anymore.
							</p>
							<p>
								The back button is shown above the content of the sidebar because the sidebar uses
								the NullRegion layout which returns a Layout object with &quot;visibleViews =
								multiple&quot;.
							</p>
						</>
					</DescriptionPanel>
					<DescriptionPanel title="Title">
						<>
							<p>
								The title, which is displayed next to the back button, is computed in the DevApp and
								set via the prop &quot;navigationBar&quot; of the ApplicationFrameLayout.
							</p>
						</>
					</DescriptionPanel>
				</LayoutGrid.Grid>
			}
			showContentButton={
				<Button
					onClick={() => sidebarContextProps?.setSubExpanded(false)}
					title="Collapse sidebar and show dashboard"
				>
					Show Dashboard
				</Button>
			}
		/>
	);
}

export const DashboardTileView: ViewNGComponent<TitledViewProps> = ({ title }) => (
	<ActionContentbox
		padding="12px"
		listenToNavigationContext
		headingElements={<ContentBoxElements.Title key="title" text={title} />}
	>
		{title === "Tile 1" ? getDescription() : "Dummy content"}
	</ActionContentbox>
);

function getDescription(): JSX.Element {
	return (
		<div>
			The dashboard shows all views below each other in mobile mode.
			<p>
				Because there is a sidebar which is not shown at the moment a back-button is shown, which
				expands the sidebar.
			</p>
			<p>
				The back-button is shown in a navigation bar, due to the fact that the layout shows multiple
				views.
			</p>
		</div>
	);
}
