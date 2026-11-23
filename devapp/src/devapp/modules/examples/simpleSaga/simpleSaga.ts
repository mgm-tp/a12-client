// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { call, cancelled, delay, put, select, takeLatest } from "typed-redux-saga";
import type { Action } from "typescript-fsa";

import {
	ActivityActions,
	ActivitySagas,
	ActivitySelectors
} from "@com.mgmtp.a12.client/client-core";
import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging/lib/factory.js";

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
