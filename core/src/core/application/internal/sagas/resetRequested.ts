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

import type { AnyAction } from "redux";
import type { SagaGenerator } from "typed-redux-saga";
import { call, put, select, takeEvery } from "typed-redux-saga";
import type { ActionCreator } from "typescript-fsa";

import { ActivityActions, ActivitySagas, ActivitySelectors } from "../../../activity/index.js";

/** @internal */
export function* applicationResetRequested(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
