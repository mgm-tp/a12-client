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
