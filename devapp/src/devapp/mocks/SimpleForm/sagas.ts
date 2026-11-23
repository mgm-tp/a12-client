// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { put, select, takeEvery } from "typed-redux-saga";
import type { Action } from "typescript-fsa";

import { Activity, ActivityActions, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";

import { assert } from "../../utils/types.js";

import { setByPath } from "./pathUtils.js";

import { SimpleFormActions } from "./index.js";

export const SimpleFormSagas: (() => SagaGenerator<void>)[] = [
	valueChangedSaga,
	saveSaga,
	cancelSaga
];

function* valueChangedSaga(): SagaGenerator<void> {
	yield* takeEvery(
		SimpleFormActions.onValueChanged.match,
		function* (action: Action<SimpleFormActions.ValueChangedPayload>) {
			const { activityId, path, value } = action.payload;
			const activity = yield* select(ActivitySelectors.activityById(activityId));
			assert(activity, `Activity ${activityId} not found`);

			const data = { ...Activity.findDefaultDataHolder(activity)?.data };

			setByPath(data, ["document", ...path.split(".")], value);

			yield* put(ActivityActions.setData({ activityId, data, dirty: true }));
		}
	);
}

function* saveSaga(): SagaGenerator<void> {
	yield* takeEvery(
		SimpleFormActions.onSave.match,
		function* (action: Action<SimpleFormActions.SavePayload>) {
			yield* put(ActivityActions.commit.started({ activityId: action.payload.activityId }));
		}
	);
}

function* cancelSaga(): SagaGenerator<void> {
	yield* takeEvery(
		SimpleFormActions.onCancel.match,
		function* (action: Action<SimpleFormActions.CancelPayload>) {
			yield* put(
				ActivityActions.cancelRequested({
					activityIds: [action.payload.activityId]
				})
			);
		}
	);
}
