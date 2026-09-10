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
import { useSelector } from "react-redux";

import type { ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import { Activity, ActivitySelectors, FrameViews } from "@com.mgmtp.a12.client/client-core";
import { addPrefix } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/utils.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";

import { selectExampleActivity } from "./descriptor.js";

export function StateChangeView({ activityId }: ViewNGProps): JSX.Element | null {
	const { subExpanded } = useContext(FrameViews.SidebarContext) ?? {};

	const locked = useSelector(state => selectExampleActivity(state)?.lock !== undefined);
	const busy = useSelector(state => selectExampleActivity(state)?.dataHolders.some(dh => dh.busy));

	const log = useSelector(
		ActivitySelectors.activityPropById(
			activityId,
			a => Activity.findDefaultDataHolder(a)?.slices.log as string[] | undefined
		)
	);

	return subExpanded ? (
		<ActionContentbox>
			<h3>Example activity state</h3>
			<ul>
				<li>
					Busy: <b> {busy ? "YES" : "NO"}</b>
				</li>
				<li>
					Locked: <b> {locked ? "YES" : "NO"}</b>
				</li>
			</ul>
			<h3>Example activity actions log</h3>
			<ul className={addPrefix("-u-text-xs -u-padding-l-xs")}>
				{log?.map((type, index) => (
					<li key={index}>{type}</li>
				))}
			</ul>
		</ActionContentbox>
	) : null;
}
