// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ModelSelectors } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ModalNotification } from "@com.mgmtp.a12.widgets/widgets-core/lib/modal-notification/main/modal-notification.view.js";

import { PersonForm } from "../../../mocks/SimpleForm/forms/person-form.js";

export function BrokenForm(props: View): JSX.Element {
	const dispatch = useDispatch();
	const errors = useSelector(ModelSelectors.allModelErrorsInScene(props.activityId));

	const cancel = useCallback(
		() => dispatch(ActivityActions.cancel({ activityId: props.activityId })),
		[dispatch, props.activityId]
	);

	return (
		<>
			{errors.length && (
				<ModalNotification
					closeOnEsc
					closeOnOutsideClick
					variant="error"
					onClose={cancel}
					title="Error"
					footer={<Button onClick={cancel} label="Close activity" />}
				>
					<p>Error(s) while loading models for this scene:</p>
					<ul>
						{errors.map(({ message, type }, index) => (
							<li key={index}>
								{type}: {message}
							</li>
						))}
					</ul>
				</ModalNotification>
			)}
			<PersonForm {...props} />
		</>
	);
}
