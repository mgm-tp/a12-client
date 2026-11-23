// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { AnyAction } from "redux";
import type { SagaGenerator } from "typed-redux-saga";
import { put } from "typed-redux-saga";
import type { Action, Failure } from "typescript-fsa";

import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging/lib/factory.js";

import { Activity, ActivityActions } from "../../../activity/index.js";

import type { ApplicationSaga } from "./ApplicationSaga.js";

function logActivityErrorSaga(): ApplicationSaga.Descriptor {
	return {
		canHandle: (_ad: Activity.Descriptor, action: AnyAction) => {
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
		canHandle: (_ad: Activity.Descriptor, action: AnyAction) => {
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
