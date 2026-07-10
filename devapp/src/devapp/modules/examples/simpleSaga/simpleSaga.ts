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
import { call, cancelled, delay, put, select, takeLatest } from "typed-redux-saga";

import type { Action } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";
import {
	ActivityActions,
	ActivitySagas,
	ActivitySelectors
} from "@com.mgmtp.a12.client/client-core";
import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging";

import { assert } from "../../../utils/types.js";

import { initiateSimpleSaga } from "./simpleSagaActions.js";

const logger = LoggerFactory.getLogger("devapp/simple-saga");

export interface DataType {
	processState: string;
}

export function* simpleSagaEventsSaga(): SagaGenerator<void> {
	yield* takeLatest(initiateSimpleSaga, process);
}

function* process(action: Action<{ activityId: string }>): SagaGenerator<void> {
	const activityId = action.payload.activityId;

	// initial delay before the actual saga starts to showcase the cancel status
	yield* delay(1000);

	const lockId = yield* call(ActivitySagas.acquireActivityLock, activityId, "process", {
		key: "Processing"
	});
	if (lockId === undefined) {
		return;
	}

	const activity = yield* select(ActivitySelectors.activityById(activityId));
	assert(activity);
	try {
		yield* put(
			ActivityActions.setDataByDescriptor({
				activityId: activityId,
				descriptor: activity.descriptor,
				data: { processState: "Loading" }
			})
		);
		yield* delay(1000);

		for (let i = 1; i <= 10; i++) {
			logger.info(`i = ${i}`);
			yield* put(
				ActivityActions.setDataByDescriptor({
					activityId: activityId,
					descriptor: activity.descriptor,
					data: { processState: `Processing Step ${i}` }
				})
			);
			yield* delay(1000);
		}
	} finally {
		yield* put(ActivityActions.unlock({ activityId: activityId, lockId: lockId }));

		yield* put(
			ActivityActions.setDataByDescriptor({
				activityId: activityId,
				descriptor: activity.descriptor,
				data: { processState: (yield* cancelled()) ? "Cancelled" : "Finished" }
			})
		);
	}
}
