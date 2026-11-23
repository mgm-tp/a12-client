// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";

import { addPrefix } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/utils.js";
import { Typography } from "@com.mgmtp.a12.widgets/widgets-core/lib/typography/main/typography.view.js";

export function InformationPanel(): JSX.Element {
	return (
		<div className={addPrefix("-u-padding-sm")}>
			<Typography.Headline level={4}>Application Frame Settings</Typography.Headline>
			<p>
				The Application Frame Layout can be configured in the application model using layout
				settings.
			</p>
			<p>Currently, it supports:</p>
			<ul>
				<li>
					<b>disableCollapsingSub</b> - Set this to true to hide the sidebar toggle button usually
					shown on the bottom of the sidebar
				</li>
				<li>
					<b>initialSubExpanded</b> - Set this to false to initially collapse the sidebar.
					Otherwise, it will be expanded initially.
				</li>
				<li>
					<b>initialSubExpandedState</b> - This can be used to define the initial sidebar size
					(minimized, maximized)
				</li>
			</ul>
			<p>
				These settings work in conjunction with the FrameViews.SidebarContext. E.g. you can combine
				them to achieve a tabbed panel in the sidebar region based on the TabPanel Widget like
				demonstrated in this showcase.
			</p>
			<p>
				The functionality and state management of this sidebar is completely custom code and needs
				to be adapted to the project needs.
			</p>
			<p>
				However, the client stores if the sidebar is expanded. You can retrieve the expanded state
				using the prop <b>subExpanded</b> from the FrameViews.SidebarContext.
			</p>
			<p>
				If you want to change it you need to call <b>setSubExpanded</b> from the
				FrameViews.SidebarContext.
			</p>
			<p>
				The client also stores the current size of the sidebar (minimized, maximized). Minimized in
				this case means, that the sidebar content is only shown on the side. It does not mean the
				content is hidden like e.g. a minimized window in an operating system. You can retrieve the
				current size using the prop <b>subExpandedState</b> from the FrameViews.SidebarContext.
			</p>
			<p>
				Again, if you want to change it you need to call <b>setSubExpandedState</b> from the
				FrameViews.SidebarContext.
			</p>
			<p>
				Please check out the devapp code to see how to the integration is done, as well as the
				Widget showcase to find more documentation for the TabPanel.
			</p>
		</div>
	);
}
