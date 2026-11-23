// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { put, select, takeEvery } from "typed-redux-saga";
import type { Action, AnyAction } from "typescript-fsa";

import {
	Activity,
	ActivityActions,
	ActivitySelectors,
	NotificationActions,
	NotificationSelectors
} from "@com.mgmtp.a12.client/client-core";

import { SimpleFormActions, SingleDocumentData } from "../../../mocks/SimpleForm/index.js";

import type { CustomNotification } from "./notification.js";

export const NotificationsSagas = [eventButtonTriggeredSaga];

function* eventButtonTriggeredSaga(): SagaGenerator<void> {
	yield* takeEvery(
		(action: AnyAction) => SimpleFormActions.onEventTriggered.match(action),
		function* (action: Action<SimpleFormActions.EventButtonTriggeredPayload>) {
			const { activityId } = action.payload;
			const activity = yield* select(ActivitySelectors.activityById(action.payload.activityId));
			if (!activity) {
				return;
			}

			switch (action.payload.eventName) {
				case "create-activity":
					yield* put(
						ActivityActions.create({
							initiatingActivityId: activityId,
							activityDescriptor: activity.descriptor
						})
					);
					break;
				case "close-activity":
					yield* put(ActivityActions.cancel({ activityId }));
					break;
				case "create-notification":
					// oxlint-disable-next-line no-case-declarations
					const data = Activity.findDefaultDataHolder(activity)?.data;
					if (!SingleDocumentData.isInstance(data)) {
						break;
					}
					// oxlint-disable-next-line no-case-declarations
					const { scope, duration, severity, position, icon, title, message } =
						data.document as unknown as NotificationDocument;

					// oxlint-disable-next-line no-case-declarations
					const notification: Omit<CustomNotification, "id"> = {
						// The split removes the "activity-" prefix that is necessary for the sorting of the external enum
						activityId: scope !== "global" ? scope.split("-")[1] : undefined,
						duration: duration || undefined,
						severity,
						position,
						icon: icon || undefined,
						title: {
							key: "customNotificationTitle",
							defaults: { en: title || undefined, de: title || undefined }
						},
						message: {
							key: "customNotificationMessage",
							defaults: { en: message || undefined, de: message || undefined }
						},
						componentId: "CustomToast",
						customTimestamp: Date.now()
					};

					yield* put(NotificationActions.add(notification));

					// After creating a notification the activity should not be considered dirty
					yield* put(ActivityActions.setDirty({ activityId, dirty: false }));
					break;
				case "remove-notifications":
					yield* put(
						NotificationActions.remove(
							(yield* select(NotificationSelectors.notifications())).map(x => x.id)
						)
					);
					break;
				default:
					break;
			}
		}
	);
}

export interface NotificationDocument {
	readonly scope: "global" | string;
	readonly severity: "info" | "success" | "warning" | "error";
	readonly display_time: "permanent" | "temporary";
	readonly position: "top-right" | "top-left" | "bottom-right" | "bottom-left";
	readonly duration?: number | null;
	readonly title?: string | null;
	readonly message?: string | null;
	readonly icon?: string | null;
}
