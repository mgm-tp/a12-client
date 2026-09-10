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

import { put } from "redux-saga/effects";
import type { SagaGenerator } from "typed-redux-saga";
import type { Action } from "typescript-fsa";
import { isType } from "typescript-fsa";

import type { Activity } from "../../../core/activity/index.js";
import { ActivityActions } from "../../../core/activity/index.js";
import type { ApplicationSaga } from "../../../core/application/index.js";

export function cancelSagaMock(): ApplicationSaga.Descriptor {
	return {
		canHandle: (
			ad: Activity.Descriptor,
			action: Action<ActivityActions.CancelRequestedPayload>
		) => {
			return isType(action, ActivityActions.cancelRequested);
		},
		handle: (action: Action<ActivityActions.CancelRequestedPayload>) => {
			return handleCancelSagaMock(action);
		}
	};
}

export function* handleCancelSagaMock(
	action: Action<ActivityActions.CancelRequestedPayload>
): SagaGenerator<void> {
	// Does not cancel but changes the dirty state
	yield put(
		ActivityActions.setDirty({
			activityId: action.payload.activityIds[0],
			dirty: true
		})
	);
}
