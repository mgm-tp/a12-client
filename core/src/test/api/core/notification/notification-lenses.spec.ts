// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Notification } from "../../../../core/notification/index.js";
import { NotificationLenses } from "../../../../core/notification/index.js";
import { createLensLawsTests } from "../../../utils/createLensLawsTests.js";

describe("core.notification", () => {
	describe("lenses", () => {
		describe("notifications slice", () => {
			describe("empty notifications slice", () => {
				const state = { notifications: [] };
				const notifications = state.notifications;
				createLensLawsTests(NotificationLenses.notifications, state, notifications);
			});

			describe("single notification slice", () => {
				const state = {
					notifications: [asNotification({ id: "1" })]
				};
				const notifications = state.notifications;
				createLensLawsTests(NotificationLenses.notifications, state, notifications);
			});
		});

		describe("single notification", () => {
			describe("non-existing notification with empty notifications slice", () => {
				const state = { notifications: [] };
				const notification = asNotification({ id: "1" });
				createLensLawsTests(
					NotificationLenses.notificationById(notification.id),
					state,
					notification
				);
			});

			describe("existing notification", () => {
				const notification = asNotification({ id: "1" });
				const changed = asNotification({
					...notification,
					componentId: "changed"
				});
				const state = {
					notifications: [notification, asNotification({ id: "2" })]
				};
				createLensLawsTests(NotificationLenses.notificationById(notification.id), state, changed);
			});

			describe("non-existing notification", () => {
				const notification = asNotification({ id: "1" });
				const anotherNotification = asNotification({ id: "2" });
				const state = {
					notifications: [anotherNotification]
				};
				createLensLawsTests(
					NotificationLenses.notificationById(notification.id),
					state,
					notification
				);
			});

			describe("undefined notification (to remove it)", () => {
				const notification = asNotification({ id: "1" });
				const state = {
					notifications: [notification]
				};
				createLensLawsTests(NotificationLenses.notificationById(notification.id), state, undefined);
			});
		});
	});
});

function asNotification(partial?: Partial<Notification>): Notification {
	return {
		id: partial?.id ?? "dummyKey",
		...partial
	};
}
