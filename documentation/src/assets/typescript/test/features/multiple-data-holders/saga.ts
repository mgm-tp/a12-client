// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { AnyAction } from "redux";
import type { SagaGenerator } from "typed-redux-saga";
import { put } from "typed-redux-saga";
import type { Action } from "typescript-fsa";

import { ActivityActions } from "@com.mgmtp.a12.client/client-core";

export function* handleInitializeDataHolders(
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

function initializeTodos(options: unknown): AnyAction {
	return {} as unknown as AnyAction;
}
