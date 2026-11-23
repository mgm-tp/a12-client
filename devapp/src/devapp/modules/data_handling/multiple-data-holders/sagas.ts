// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { put, takeLatest } from "typed-redux-saga";
import type { Action, AnyAction } from "typescript-fsa";

import { ActivityActions } from "@com.mgmtp.a12.client/client-core";

import { initializeTodos } from "./actions.js";
import { isExampleDescriptor } from "./descriptor.js";

export function* initializeDataHolders(): SagaGenerator<void> {
	yield* takeLatest(
		(action: AnyAction) =>
			ActivityActions.push.match(action) && isExampleDescriptor(action.payload.activity.descriptor),
		handleInitializeDataHolders
	);
}

function* handleInitializeDataHolders(
	action: Action<ActivityActions.PushPayload>
): SagaGenerator<void> {
	const {
		payload: {
			activity: { id: activityId }
		}
	} = action;

	try {
		yield* put(initializeTodos({ activityId, listIds: ["A", "B"] }));
	} catch (error) {
		yield* put(ActivityActions.error({ activityId, error, operationType: "loading" }));
	}
}
