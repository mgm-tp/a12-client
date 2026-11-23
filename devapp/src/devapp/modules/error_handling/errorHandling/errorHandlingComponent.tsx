// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	NEW_INSTANCE_IDENTIFIER
} from "@com.mgmtp.a12.client/client-core";

import { BrokenForm } from "./BrokenForm.js";
import { initiateErrorHandlingSaga } from "./errorHandlingSagaActions.js";
import { ErrorHandlingTemplate } from "./errorHandlingTemplate.js";

function GeneralErrorHandling({ name, activityId, ariaLevel }: View): JSX.Element {
	const dispatch = useDispatch();

	const descriptor = useSelector(ActivitySelectors.activityPropById(activityId, a => a.descriptor));

	return (
		<ErrorHandlingTemplate
			viewName={name}
			activityId={activityId}
			ariaLevel={ariaLevel}
			onTriggerError={(errorCode: string) =>
				dispatch(
					errorCode === "NOT_FOUND"
						? ActivityActions.create({
								initiatingActivityId: activityId,
								activityDescriptor: {
									...descriptor,
									model: "Person-document",
									instance: NEW_INSTANCE_IDENTIFIER
								}
							})
						: initiateErrorHandlingSaga({
								activityId,
								errorCode
							})
				)
			}
			onClearError={() => dispatch(ActivityActions.clearError({ activityId }))}
		/>
	);
}

const Views: { [name: string]: View.ViewComponent } = {
	GeneralErrorHandling,
	BrokenForm
};

export default function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}
