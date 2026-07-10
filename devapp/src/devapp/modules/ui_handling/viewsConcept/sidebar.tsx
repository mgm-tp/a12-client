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

import type { ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import { FrameViews } from "@com.mgmtp.a12.client/client-core";
import { Button, ActionContentbox, SizeContext } from "@com.mgmtp.a12.widgets/widgets-core";

import { isOnSmallDevice } from "../../../utils/isOnSmallDevice.js";

export function SampleSidebarContent(props: ViewNGProps): JSX.Element | null {
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
