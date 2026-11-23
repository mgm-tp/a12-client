// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { call, put, takeLatest } from "typed-redux-saga";
import type { Action } from "typescript-fsa";

import { ActivityActions } from "@com.mgmtp.a12.client/client-core";

import type { PayloadInitiateErrorHandling } from "./errorHandlingSagaActions.js";
import { initiateErrorHandlingSaga } from "./errorHandlingSagaActions.js";
import type { SampleApplicationError } from "./errors.js";

const testErrors: SampleApplicationError[] = [
	{
		errorCode: "SAMPLE_SUBSYSTEM_NOT_AVAILABLE",
		subsystem: "database"
	},
	{
		errorCode: "SAMPLE_VALIDATION_ERROR",
		message: "Some values are not valid, please correct",
		errors: [
			{
				fieldName: "Name",
				message: "Value is required and cannot be missing or blank"
			},
			{ fieldName: "Age", message: "Value must be a number" }
		]
	},
	{
		errorCode: "SAMPLE_NOT_AUTHORIZED_ERROR"
	},
	{
		errorCode: "INTERNAL_CLIENT_ERROR",
		message: "Something bad happened in the client"
	},
	{
		errorCode: "NULL_ERROR"
	}
];

export default function* errorHandlingSagaEventsSaga(): SagaGenerator<void> {
	yield* takeLatest(initiateErrorHandlingSaga, handleErrorHandlingSaga);
}

function* handleErrorHandlingSaga(
	action: Action<PayloadInitiateErrorHandling>
): SagaGenerator<void> {
	const { errorCode, activityId } = action.payload;
	try {
		yield* call(handleAction, errorCode);
	} catch (error) {
		yield* put(ActivityActions.error({ activityId, operationType: "saving", error }));
	}
}

function handleAction(errorCode: string): Promise<void> {
	const testError = testErrors.find(error => error.errorCode === errorCode);
	if (testError !== undefined && testError.errorCode === "NULL_ERROR") {
		return Promise.reject(null);
	}
	return Promise.reject(testError);
}
