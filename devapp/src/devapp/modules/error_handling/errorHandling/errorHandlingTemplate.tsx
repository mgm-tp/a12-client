// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX, MouseEvent } from "react";
import { useSelector } from "react-redux";

import { ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";
import { ModalNotification } from "@com.mgmtp.a12.widgets/widgets-core/lib/modal-notification/main/modal-notification.view.js";

import type { SampleApplicationError } from "./errors.js";

const EXAMPLE_ERRORS = [
	{
		errorCode: "SAMPLE_SUBSYSTEM_NOT_AVAILABLE",
		text: "Example for subsystem not available error - displayed as global message."
	},
	{
		errorCode: "SAMPLE_VALIDATION_ERROR",
		text: "Example for validation error."
	},
	{
		errorCode: "SAMPLE_NOT_AUTHORIZED_ERROR",
		text: "Example for not authorized error."
	},
	{
		errorCode: "INTERNAL_CLIENT_ERROR",
		text: "Example for an internal client error that is thrown explicitly."
	},
	{
		errorCode: "UNDEFINED_ERROR",
		text: "If for some reason the error is undefined, it throws an internal client error."
	},
	{
		errorCode: "NULL_ERROR",
		text: "If for some reason the error is null, it throws an internal client error."
	},
	{
		errorCode: "NOT_FOUND",
		text: "Example for an error during model loading in a sub activity."
	}
];

export interface ErrorHandlingTemplateProps {
	viewName: string;
	activityId: string;
	ariaLevel?: number;
	onTriggerError(errorId: string): void;
	onClearError(): void;
}
export function ErrorHandlingTemplate(props: ErrorHandlingTemplateProps) {
	const { activityId, viewName, onClearError, onTriggerError, ariaLevel } = props;

	const savingState = useSelector(ActivitySelectors.savingStateById(activityId));

	const error = useSelector(ActivitySelectors.error(activityId)) as
		| SampleApplicationError
		| undefined;

	return (
		<ActionContentbox
			listenToNavigationContext
			headingElements={<ContentBoxElements.Title text={viewName} ariaLevel={ariaLevel} />}
		>
			<p>This is a demonstration of handling errors by sagas.</p>
			<p>Click one of the following buttons to trigger a specific error:</p>
			{EXAMPLE_ERRORS.map(({ errorCode, text }) => (
				<div key={errorCode}>
					<Button
						id={errorCode}
						onClick={(event: MouseEvent<HTMLElement>) => onTriggerError(event.currentTarget.id)}
					>
						{errorCode}
					</Button>
					&quot;: &quot;<span>{text}</span>
				</div>
			))}
			{savingState === "error" && error && error.errorCode !== "SAMPLE_SUBSYSTEM_NOT_AVAILABLE" && (
				<ModalNotification
					closeOnEsc
					closeOnOutsideClick
					variant="error"
					onClose={onClearError}
					key="modal"
					title="Error"
					footer={<Button onClick={onClearError} label="Close" />}
				>
					<ErrorDescription error={error} />
				</ModalNotification>
			)}
		</ActionContentbox>
	);
}

function ErrorDescription(props: { error: SampleApplicationError }): JSX.Element | null {
	const { error } = props;
	switch (error.errorCode) {
		case "SAMPLE_VALIDATION_ERROR":
			return (
				<div>
					<p>DevApp error</p>
					{error.message}:
					<ul>
						{error.errors.map(({ fieldName, message }, index) => (
							<li key={`${index}-${fieldName}`}>
								{fieldName}: {message}
							</li>
						))}
					</ul>
				</div>
			);
		case "SAMPLE_NOT_AUTHORIZED_ERROR":
			return (
				<div>
					<p>DevApp error</p>
					<p>You don&apos;t have sufficient permissions to perform this operation</p>
				</div>
			);
		case "INTERNAL_CLIENT_ERROR":
			return (
				<div>
					<p>Platform error</p>
					<p>Internal client error: {error.message}</p>
				</div>
			);
		default:
			return null;
	}
}
