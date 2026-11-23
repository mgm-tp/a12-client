// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { call, put, select, takeLatest } from "typed-redux-saga";
import type { Action } from "typescript-fsa";

import type { Selector } from "@com.mgmtp.a12.client/client-core";
import { Activity, ActivityActions, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";

import { SimpleFormActions, SingleDocumentData } from "../../../mocks/SimpleForm/index.js";
import { DocumentListData } from "../../../mocks/SimpleOverview/data.js";

export function* eventTriggerSaga(): SagaGenerator<void> {
	yield* takeLatest(SimpleFormActions.onEventTriggered, handle);
}

function* handle(
	action: Action<SimpleFormActions.EventButtonTriggeredPayload>
): SagaGenerator<void> {
	const { activityId, eventName: direction } = action.payload;
	if (direction === "back") {
		const replacementActivity = yield* call(createReplacementActivity, activityId, direction);
		yield* put(ActivityActions.cancelRequested({ activityIds: [activityId], replacementActivity }));
	} else if (direction === "forward") {
		const replacementActivity = yield* call(createReplacementActivity, activityId, direction);
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

		const singleDocumentData = getDefaultData(activity, SingleDocumentData.isInstance);
		const documentListData = getDefaultData(initiatingActivity, DocumentListData.isInstance);
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
