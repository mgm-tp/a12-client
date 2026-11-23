// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX, ReactElement, ReactNode } from "react";
import { useContext } from "react";

import { FrameViews } from "@com.mgmtp.a12.client/client-core";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { SizeContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-context.js";
import { MessageBox } from "@com.mgmtp.a12.widgets/widgets-core/lib/message-box/main/message-box.view.js";
import { Typography } from "@com.mgmtp.a12.widgets/widgets-core/lib/typography/main/typography.view.js";

import isOnSmallDevice from "../../../../utils/isOnSmallDevice.js";

export function SidebarContent(props: {
	readonly title?: string;
	readonly content: ReactElement;
	readonly showContentButton: ReactElement;
	readonly showDeviceInformation?: boolean;
}): ReactNode {
	const sidebarContextProps = useContext(FrameViews.SidebarContext);
	const smallDevice = isOnSmallDevice(useContext(SizeContext).currentSize);
	if (!sidebarContextProps?.subExpanded) {
		return null;
	}

	return (
		<ActionContentbox>
			{props.title && <Typography.Headline level={4}>{props.title}</Typography.Headline>}
			{props.content}
			{smallDevice && props.showContentButton}
			{props.showDeviceInformation ? <ShowDeviceInformation /> : null}
		</ActionContentbox>
	);
}

export function ShowDeviceInformation(): JSX.Element | null {
	return !isOnSmallDevice(useContext(SizeContext).currentSize) ? (
		<MessageBox
			label="Switch your device to 'phone' (e.g. Ctrl + Shift + M on the page in Firefox or in the developer tools in Chrome) to see the described behavior."
			variant="warning"
		/>
	) : null;
}
