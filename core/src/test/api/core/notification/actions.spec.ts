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

import { deepStrictEqual } from "node:assert/strict";

import type { Action } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";

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
