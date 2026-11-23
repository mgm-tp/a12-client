// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual } from "node:assert/strict";

import type { Action } from "typescript-fsa";

import type { Notification } from "../../../../core/notification/index.js";
import { NotificationActions } from "../../../../core/notification/index.js";

describe("core.notification.actions", () => {
	describe("add", () => {
		it("is an action, that can be dispatched with a Notification as payload", () => {
			const notificationMock: Notification = {
				id: "1"
			};
			const expectedAction: Action<Notification> = {
				type: "notification/add",
				payload: notificationMock
			};

			deepStrictEqual(NotificationActions.add(notificationMock), expectedAction);
		});
	});

	describe("remove", () => {
		it("is an action, that can be dispatched with a number as payload", () => {
			const idMock = "1";
			const expectedAction: Action<string[]> = {
				type: "notification/remove",
				payload: [idMock]
			};

			deepStrictEqual(NotificationActions.remove([idMock]), expectedAction);
		});
	});

	describe("removeByActivityIds", () => {
		it("is an action, that can be dispatched with a list of strings as payload", () => {
			const idMock = "1";
			const expectedAction: Action<string[]> = {
				type: "notification/remove_by_activity_ids",
				payload: [idMock]
			};

			deepStrictEqual(NotificationActions.removeByActivityIds([idMock]), expectedAction);
		});
	});
});
