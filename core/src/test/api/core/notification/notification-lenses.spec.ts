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
