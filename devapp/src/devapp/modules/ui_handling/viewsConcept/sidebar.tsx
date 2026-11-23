// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useContext } from "react";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { FrameViews } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { SizeContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-context.js";

import isOnSmallDevice from "../../../utils/isOnSmallDevice.js";

export default function SampleSidebarContent(props: View): JSX.Element | null {
	const sidebarContextProps = useContext(FrameViews.SidebarContext);
	const currentSize = useContext(SizeContext).currentSize;

	if (sidebarContextProps?.subExpanded === false) {
		return null;
	}
	return (
		<ActionContentbox>
			<h3>Custom Sidebar View</h3>
			<ul>
				<li>Custom Sidebar Content</li>
				<li>Activity: {props.activityId}</li>
			</ul>
			{isOnSmallDevice(currentSize) ? (
				<Button onClick={() => sidebarContextProps?.setSubExpanded(false)}>Close sidebar</Button>
			) : null}
		</ActionContentbox>
	);
}
