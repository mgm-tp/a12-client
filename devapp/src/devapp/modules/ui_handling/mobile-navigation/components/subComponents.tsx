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
