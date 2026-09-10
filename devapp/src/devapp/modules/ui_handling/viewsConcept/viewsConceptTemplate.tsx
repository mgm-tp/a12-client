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
import { useDispatch, useSelector } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

let ID_COUNT = 0;

export default function ViewsConceptTemplate(props: View): JSX.Element {
	const dispatch = useDispatch();
	const initiatingActivityId = useSelector(
		ActivitySelectors.activityPropById(props.activityId, a => a.initiatingActivityId)
	);
	const descriptor = useSelector(
		ActivitySelectors.activityPropById(props.activityId, a => a.descriptor)
	);

	const title = "ViewsConcept" + (initiatingActivityId ? " (nested)" : "");

	return (
		<ActionContentbox
			listenToNavigationContext
			headingElements={<ContentBoxElements.Title text={title} ariaLevel={props.ariaLevel} />}
		>
			<p>This is an example ui component to demonstrate the views concept.</p>
			<p>Below, the ID of the underlying activity is shown.</p>
			<p>All views share the same activity.</p>
			<p>But each view has its own dedicated ui component.</p>
			<ul>
				<li>activity: {props.activityId}</li>
			</ul>

			<p>Click this button to cancel the activity and close all views:</p>
			<Button
				primary
				destructive
				disabled={!initiatingActivityId}
				onClick={() =>
					dispatch(
						ActivityActions.cancelRequested({
							activityIds: [props.activityId]
						})
					)
				}
			>
				Cancel Activity
			</Button>

			<p>Click this button to start a nested activity:</p>
			<Button
				primary
				onClick={() =>
					dispatch(
						ActivityActions.create({
							activityDescriptor: {
								...descriptor,
								instance: `${++ID_COUNT}`
							},
							loadingState: "without",
							initiatingActivityId: props.activityId
						})
					)
				}
			>
				Start Nested Activity
			</Button>
		</ActionContentbox>
	);
}
