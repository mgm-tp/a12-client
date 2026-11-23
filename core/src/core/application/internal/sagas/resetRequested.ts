// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { AnyAction } from "redux";
import type { SagaGenerator } from "typed-redux-saga";
import { call, put, select, takeEvery } from "typed-redux-saga";
import type { ActionCreator } from "typescript-fsa";

import { ActivityActions, ActivitySagas, ActivitySelectors } from "../../../activity/index.js";

/** @internal */
export function* applicationResetRequested(
	// oxlint-disable-next-line typescript/no-explicit-any
	trigger: ActionCreator<any>[],
	resetConfirmed: AnyAction
): SagaGenerator<void> {
	yield* takeEvery(trigger, handleApplicationResetRequested, resetConfirmed);
}

function* handleApplicationResetRequested(resetConfirmed: AnyAction): SagaGenerator<void> {
	const activities = yield* select(ActivitySelectors.activities());
	const activityIds = Object.keys(activities);

	if (activityIds.length > 0) {
		yield* put(ActivityActions.cancelRequested({ activityIds }));

		const cancelled = yield* call(ActivitySagas.waitForResponseCancelRequested);
		if (!cancelled) {
			return;
		}
	}

	yield* put(resetConfirmed);
}
