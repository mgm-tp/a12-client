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

import type { AnyAction } from "redux";
import type { SagaGenerator } from "typed-redux-saga";
import { put } from "typed-redux-saga";
import type { Action, Failure } from "typescript-fsa";

import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging/lib/factory.js";

import { Activity, ActivityActions } from "../../../activity/index.js";

import type { ApplicationSaga } from "./ApplicationSaga.js";

function logActivityErrorSaga(): ApplicationSaga.Descriptor {
	return {
		canHandle: (ad: Activity.Descriptor, action: AnyAction) => {
			return ActivityActions.error.match(action);
		},
		handle: (action: Action<ActivityActions.ErrorPayload>) => {
			return logActivityError(action);
		}
	};
}

const logger = LoggerFactory.getLogger("core/application");

function* logActivityError(action: Action<ActivityActions.ErrorPayload>): SagaGenerator<void> {
	const { activityId, error, operationType } = action.payload;

	logger.error(
		`Error ${
			operationType === undefined ? "for" : `while ${operationType}`
		} activity (ID ${activityId})`,
		error
	);
}

function saveActivityFailedSaga(): ApplicationSaga.Descriptor {
	return {
		canHandle: (ad: Activity.Descriptor, action: AnyAction) => {
			return (
				ActivityActions.save.failed.match(action) || ActivityActions.commit.failed.match(action)
			);
		},
		handle: (action: Action<Failure<ActivityActions.ActivityActionPayload, unknown>>) => {
			return saveActivityFailed(action);
		}
	};
}

function* saveActivityFailed(
	action: Action<Failure<ActivityActions.ActivityActionPayload, unknown>>
): SagaGenerator<void> {
	yield* put(
		ActivityActions.error({
			activityId: action.payload.params.activityId,
			operationType: "saving",
			// Errors which extend Activity.Error.Base aren't wrapped into an Activity.Error.Saving error
			// before adding them to the activity.
			error: Activity.Error.isInstance(action.payload.error)
				? action.payload.error
				: {
						errorCode: "SAVING_FAILED_ERROR",
						content: action.payload.error
					}
		})
	);
}

/** @internal */
export default {
	logActivityErrorSaga,
	saveActivityFailedSaga
};
