// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { call, put, select, takeLatest } from "typed-redux-saga";
import type { Action } from "typescript-fsa";

import {
	Activity,
	ActivityActions,
	ActivitySagas,
	ActivitySelectors,
	NEW_INSTANCE_IDENTIFIER
} from "@com.mgmtp.a12.client/client-core";

import { SimpleOverviewActions } from "./actions.js";

export const SimpleOverviewSagas = [
	queryParametersChangedSaga,
	selectDocumentSaga,
	createDocumentSaga
];

function* queryParametersChangedSaga(): SagaGenerator<void> {
	yield* takeLatest(
		SimpleOverviewActions.onQueryParametersChanged.match,
		function* (action: Action<ActivityActions.ActivityActionPayload>) {
			const { activityId } = action.payload;
			const defaultDataHolder = Activity.findDefaultDataHolder(
				yield* select(ActivitySelectors.activityById(activityId))
			);
			if (!defaultDataHolder) {
				throw new Error(`Default data holder for activity ${activityId} does not exist`);
			}

			yield* put(
				ActivityActions.loadData({
					activityId,
					dataHolderDescriptors: [defaultDataHolder.descriptor]
				})
			);
		}
	);
}

function* selectDocumentSaga(): SagaGenerator<void> {
	yield* takeLatest(
		SimpleOverviewActions.onSelectDocument.match,
		function* (action: Action<SimpleOverviewActions.SelectDocumentPayload>) {
			const activityId = action.payload.activityId;

			const activity = yield* select(ActivitySelectors.activityById(activityId));
			if (activity === undefined) {
				throw new Error(`Activity [id: ${activityId}] does not exist in the store anymore.`);
			}

			const createActivity = ActivityActions.create({
				activityDescriptor: {
					...activity.descriptor,
					model: action.payload.model,
					instance: action.payload.documentId
				},
				initiatingActivityId: activityId
			});

			yield* call(cancelDocumentActivityIfPresent, activityId, createActivity);
		}
	);
}

function* createDocumentSaga(): SagaGenerator<void> {
	yield* takeLatest(
		SimpleOverviewActions.onCreateDocument.match,
		function* ({ payload }: Action<SimpleOverviewActions.CreateDocumentPayload>) {
			const activity = yield* select(ActivitySelectors.activityById(payload.activityId));
			if (activity === undefined) {
				throw new Error(
					`Activity [id: ${payload.activityId}] does not exist in the store anymore.`
				);
			}

			const createActivity = ActivityActions.create({
				activityDescriptor: {
					...activity.descriptor,
					instance: NEW_INSTANCE_IDENTIFIER
				},
				initiatingActivityId: payload.activityId
			});

			yield* call(cancelDocumentActivityIfPresent, payload.activityId, createActivity);
		}
	);
}

function* cancelDocumentActivityIfPresent(
	activityId: string,
	action: Action<ActivityActions.PushPayload>
): SagaGenerator<void> {
	const activityWithInstance = yield* select(
		ActivitySelectors.childActivityWithInstance(activityId)
	);
	if (activityWithInstance) {
		yield* put(
			ActivityActions.cancelRequested({
				activityIds: [activityWithInstance.id],
				replacementActivity: action.payload.activity
			})
		);

		const cancelled = yield* call(ActivitySagas.waitForResponseCancelRequested);
		if (!cancelled) {
			return;
		}
	} else {
		yield* put(action);
	}
}
