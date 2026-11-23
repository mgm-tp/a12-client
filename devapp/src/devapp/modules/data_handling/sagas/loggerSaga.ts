// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
