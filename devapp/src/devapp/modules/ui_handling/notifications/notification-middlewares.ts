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
					// eslint-disable-next-line no-case-declarations
					const data = Activity.findDefaultDataHolder(activity)?.data;
					if (!SingleDocumentData.isInstance(data)) {
						break;
					}
					// eslint-disable-next-line no-case-declarations
					const { scope, duration, severity, position, icon, title, message } =
						data.document as unknown as NotificationDocument;

					// eslint-disable-next-line no-case-declarations
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
