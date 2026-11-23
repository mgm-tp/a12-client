// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
