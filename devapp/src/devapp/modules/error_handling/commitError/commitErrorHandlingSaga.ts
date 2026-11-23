// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { put, takeLatest } from "typed-redux-saga";
import type { Action } from "typescript-fsa";
import { actionCreatorFactory } from "typescript-fsa";

import { ActivityActions } from "@com.mgmtp.a12.client/client-core";

const actionCreator = actionCreatorFactory("Features");
export const initiateCommitErrorHandlingSaga = actionCreator<{
	activityId: string;
}>("INIT_COMMIT_ERROR_HANDLING_SAGA");

export function* commitErrorHandlingSaga(): SagaGenerator<void> {
	yield* takeLatest(initiateCommitErrorHandlingSaga, handleCommitError);
}

function* handleCommitError({
	payload: { activityId }
}: Action<{ readonly activityId: string }>): SagaGenerator<void> {
	yield* put(ActivityActions.setData({ activityId, data: {}, dirty: true }));
	yield* put(ActivityActions.commit.started({ activityId }));
}
