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

import { addPrefix, Typography } from "@com.mgmtp.a12.widgets/widgets-core";

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
