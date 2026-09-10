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

import { deepStrictEqual, partialDeepStrictEqual, strictEqual } from "node:assert/strict";

import type { Action } from "typescript-fsa";

import type { Notification } from "../../../../core/notification/index.js";
import { NotificationActions, NotificationReducers } from "../../../../core/notification/index.js";

describe("extensions.notification.reducers", () => {
	describe("notifications", () => {
		describe("Given a store with notifications", () => {
			const notification: Omit<Notification, "id"> = {
				message: { key: "NEW" }
			};

			const notifications: Notification[] = [
				{
					id: "0",
					message: { key: "OLD_0" }
				},
				{
					id: "1",
					message: { key: "OLD_1" }
				},
				{
					id: "2",
					activityId: "A",
					message: { key: "OLD_2" }
				},
				{
					id: "3",
					activityId: "A",
					message: { key: "OLD_3" }
				},
				{
					id: "4",
					activityId: "B",
					message: { key: "OLD_4" }
				}
			];

			describe("and given an action of type NotificationActions.add", () => {
				it("returns a list consisting of the given notification and the new notification from the action", () => {
					const newNotifications = NotificationReducers.notifications(
						notifications,
						NotificationActions.add(notification)
					);

					strictEqual(newNotifications.length > notifications.length, true);
					partialDeepStrictEqual(newNotifications[newNotifications.length - 1], notification);
				});
			});

			describe("and given an action of type NotificationActions.remove", () => {
				it(
					"returns a list consisting of the given notification " +
						"without the notification with the id given in the action",
					() => {
						const [n1, n2, ...remainingNotifications] = notifications;

						const newNotifications = NotificationReducers.notifications(
							notifications,
							NotificationActions.remove([n2.id])
						);

						strictEqual(newNotifications.includes(n2), false);

						[n1, ...remainingNotifications].forEach(n => {
							strictEqual(newNotifications.includes(n), true);
						});
					}
				);
			});

			describe("and given an action of type NotificationActions.removeByActivityIds", () => {
				it(
					"returns a list consisting of the given notification " +
						"without the notification with the activity id given in the action",
					() => {
						const newNotifications = NotificationReducers.notifications(
							notifications,
							NotificationActions.removeByActivityIds(["A"])
						);

						deepStrictEqual(
							newNotifications,
							notifications.filter(x => x.activityId !== "A")
						);
					}
				);
			});

			describe("and given an action from an other type than NotificationActions", () => {
				it("returns the given Notifications from the store", () => {
					const emptyAction: Action<{}> = {
						type: "EmptyAction",
						payload: {}
					};

					strictEqual(
						NotificationReducers.notifications(notifications, emptyAction),
						notifications
					);
				});
			});
		});
	});
});
