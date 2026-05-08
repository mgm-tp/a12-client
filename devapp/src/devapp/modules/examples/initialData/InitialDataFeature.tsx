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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import type { JSX } from "react";
import { useCallback } from "react";
import { useDispatch } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, NEW_INSTANCE_IDENTIFIER } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

export function InitialDataFeature(props: View): JSX.Element {
	const dispatch = useDispatch();
	const onOpenForm = useCallback(() => {
		dispatch(
			ActivityActions.create({
				initiatingActivityId: props.activityId,
				activityDescriptor: { model: "InitialData", instance: NEW_INSTANCE_IDENTIFIER },
				data: {
					document: {
						id: NEW_INSTANCE_IDENTIFIER,
						modelId: "InitialData-document",
						root: {
							field1: "This value was created in code at " + new Date(),
							field2: ""
						}
					}
				}
			})
		);
	}, [dispatch, props.activityId]);

	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title
					text="Create an activity with initial data"
					ariaLevel={props.ariaLevel}
				/>
			}
		>
			<p>
				This example shows how to add additional initial data to an activity after the normal
				initialization.
			</p>
			<p>
				If you click the following button, an activity containing a new document with prefilled data
				will be created.
			</p>
			<Button primary onClick={onOpenForm}>
				Start Activity
			</Button>
		</ActionContentbox>
	);
}
