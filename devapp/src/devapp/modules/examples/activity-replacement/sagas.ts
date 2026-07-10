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

import type { Selector } from "@com.mgmtp.a12.client/client-core";
import { Activity, ActivityActions, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import type { Action } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";

import { isSingleDocumentData } from "../../../mocks/SimpleForm/data.js";
import { SimpleFormActions } from "../../../mocks/SimpleForm/index.js";
import { isDocumentListData } from "../../../mocks/SimpleOverview/data.js";

export function* eventTriggerSaga(): SagaGenerator<void> {
	yield* takeLatest(SimpleFormActions.onEventTriggered, handle);
}

function* handle(
	action: Action<SimpleFormActions.EventButtonTriggeredPayload>
): SagaGenerator<void> {
	const { activityId, eventName: direction } = action.payload;
	if (direction === "back") {
		const replacementActivity = yield* call(() => createReplacementActivity(activityId, direction));
		yield* put(ActivityActions.cancelRequested({ activityIds: [activityId], replacementActivity }));
	} else if (direction === "forward") {
		const replacementActivity = yield* call(() => createReplacementActivity(activityId, direction));
		yield* put(ActivityActions.commit.started({ activityId, replacementActivity }));
	}
}

function* createReplacementActivity(
	activityId: string,
	direction: "back" | "forward"
): SagaGenerator<Activity | undefined> {
	const documentId = yield* select(selectNextDocumentId(activityId, direction));
	if (!documentId) {
		return undefined;
	}

	const { activity, initiatingActivity } = yield* select(selectActivities(activityId));

	return ActivityActions.create({
		activityDescriptor: { ...activity.descriptor, instance: documentId },
		initiatingActivityId: initiatingActivity.id,
		loadingState: "missing"
	}).payload.activity;
}

export function selectNextDocumentId(
	activityId: string,
	direction: "back" | "forward"
): Selector<string | undefined> {
	return state => {
		const { activity, initiatingActivity } = selectActivities(activityId)(state);

		const singleDocumentData = getDefaultData(activity, isSingleDocumentData);
		const documentListData = getDefaultData(initiatingActivity, isDocumentListData);
		if (!singleDocumentData || !documentListData) {
			return undefined;
		}

		const index = documentListData.documents.findIndex(
			document => document.id === singleDocumentData.document.id
		);
		const nextIndex = index + (direction === "back" ? -1 : 1);

		if (index < 0 || nextIndex < 0 || nextIndex >= documentListData.documents.length) {
			return undefined;
		}

		return documentListData.documents[nextIndex].id;
	};
}

function selectActivities(
	activityId: string
): Selector<{ activity: Activity; initiatingActivity: Activity }> {
	return state => {
		const activity = ActivitySelectors.activityById(activityId)(state);
		if (!activity?.initiatingActivityId) {
			throw new Error(`"No activity with id "${activityId}" found."`);
		}

		const initiatingActivity = ActivitySelectors.activityById(activity.initiatingActivityId)(state);
		if (!initiatingActivity) {
			throw new Error(`"No activity with id "${initiatingActivity}" found."`);
		}

		return { activity, initiatingActivity };
	};
}

function getDefaultData<T>(
	{ descriptor, dataHolders }: Activity,
	checker: (object: Partial<T>) => object is T
): T | undefined {
	const { data = {} } = dataHolders.find(Activity.DataHolder.hasDescriptor(descriptor)) || {};
	return checker(data) ? data : undefined;
}
