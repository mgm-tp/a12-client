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
