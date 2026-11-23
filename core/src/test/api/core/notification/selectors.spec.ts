// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";

import type { Notification } from "../../../../core/notification/index.js";
import { NotificationSelectors } from "../../../../core/notification/index.js";

describe("core.notification.selectors", () => {
	describe("notifications", () => {
		describe("Given a store with multiple entries including notifications", () => {
			const notifications: Notification[] = [
				{
					id: "0",
					message: { key: "OLD_0" }
				},
				{
					id: "1",
					message: { key: "OLD_1" }
				}
			];

			it("returns only the list of notifications", () => {
				const selection = NotificationSelectors.notifications()({
					notifications,
					somethingElse: true
				});
				strictEqual(selection, notifications);
			});
		});
	});
});
