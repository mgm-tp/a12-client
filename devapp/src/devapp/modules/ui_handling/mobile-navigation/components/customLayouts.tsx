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

import type { ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, FrameViews } from "@com.mgmtp.a12.client/client-core";
import { Button, ActionContentbox, ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core";

import { DescriptionPanel } from "./descriptionPanel.js";
import { SidebarContent } from "./subComponents.js";

export function CustomLayoutSidebar(): JSX.Element {
	const sidebarContextProps = useContext(FrameViews.SidebarContext);
	return (
		<SidebarContent
			title="Custom Layout Sidebar"
			showDeviceInformation={true}
			content={
				<>
					<DescriptionPanel title="General Description" open={true}>
						<>
							<p>
								This is an example for a custom layout which always shows the last two views. <br />
								In desktop mode it shows the views next to each other, while in mobile mode they are
								displayed below each other.
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
								At the moment no back button is shown because there is no view before the current
								visible sidebar view.
							</p>
						</>
					</DescriptionPanel>
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

export function CustomLayoutView(props: ViewNGProps): JSX.Element {
	const dispatch = useDispatch();
	return (
		<ActionContentbox headingElements={<ContentBoxElements.Title text={"Initial view"} />}>
			<DescriptionPanel title="General Description" open={true}>
				<>
					<p>
						This is the initial view which belongs to the current activity.
						<br />
						With &quot;Open Detail View&quot; one can start a new activity which adds another view
						to the layout.
					</p>
				</>
			</DescriptionPanel>
			<DescriptionPanel title="Back button">
				<>
					<p>
						A back-button is shown in a navigation-bar because the layout provider of this layout
						returns an object which contains &apos;visibleView: &quot;multiple&quot;&apos;, meaning
						the layout shows multiple views at once.
					</p>
					<p>If only this view is visible a click on the back-button will expand the sidebar</p>
					<p>
						If the detail view is open as well, then a click on the back-button will cancel the last
						activity to remove the last added view.
					</p>
				</>
			</DescriptionPanel>
			<Button
				onClick={() =>
					dispatch(
						ActivityActions.create({
							activityDescriptor: {
								section: "UIHandling",
								feature: "CustomDetailView"
							},
							initiatingActivityId: props.activityId,
							loadingState: "without"
						})
					)
				}
			>
				Open detail view
			</Button>
		</ActionContentbox>
	);
}

export function CustomDetailView({ activityId }: ViewNGProps): JSX.Element {
	const dispatch = useDispatch();
	return (
		<ActionContentbox
			headingElements={<ContentBoxElements.Title text={"Detail view"} />}
			footer={
				<ContentBoxElements.Footer>
					<Button
						destructive
						onClick={() =>
							dispatch(
								ActivityActions.cancel({
									activityId
								})
							)
						}
					>
						Close view
					</Button>
				</ContentBoxElements.Footer>
			}
		>
			<p> Dummy text </p>
		</ActionContentbox>
	);
}
