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

import type { SagaGenerator } from "typed-redux-saga";
import { put, select, takeEvery } from "typed-redux-saga";

import { ActivityActions } from "@com.mgmtp.a12.client/client-core";

import { logActionType } from "./actions.js";
import { selectFrameActivity } from "./descriptor.js";

export function* loggerSaga(): SagaGenerator<void> {
	yield* takeEvery(
		[
			ActivityActions.loadData,
			ActivityActions.reloadData,
			ActivityActions.removeData,
			ActivityActions.save.started,
			ActivityActions.save.done,
			ActivityActions.commit.started,
			ActivityActions.commit.done
		],
		function* (action) {
			const frameActivity = yield* select(selectFrameActivity);
			if (frameActivity) {
				yield* put(
					logActionType({
						activityId: frameActivity.id,
						type: action.type
					})
				);
			}
		}
	);
}
