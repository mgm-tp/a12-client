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

import { deepStrictEqual } from "node:assert/strict";

import { ActivityActions } from "../../../../core/activity/index.js";
import { NotificationActions } from "../../../../core/notification/index.js";
import { removeNotificationsByActivityCloseMiddleware } from "../../../../core/notification/internal/middlewares.js";
import { createStoreForTest } from "../../../unit/core/frame/utils.js";
import { createActivity } from "../../../utils/activity.js";

describe("core.notification.middleware", () => {
	describe("an ActivityAction.commit.done was dispatched", () => {
		it("dispatches a NotificationAction.removeByActivityIds with all child activityIds", () => {
			const activities = {
				A: createActivity({ id: "A" }),
				B: createActivity({ id: "B", initiatingActivityId: "A" }),
				C: createActivity({ id: "C", initiatingActivityId: "A" })
			};

			const store = createStoreForTest({ initialState: { activities } });

			removeNotificationsByActivityCloseMiddleware(store)(x => x)(
				ActivityActions.commit.done({ params: { activityId: "A" }, result: {} })
			);

			const expectedAction = NotificationActions.removeByActivityIds(["A", "B", "C"]);

			const actualAction = store.getActions().find(a => a.type === expectedAction.type);
			deepStrictEqual(actualAction, expectedAction);
		});
	});

	describe("an ActivityAction.cancel was dispatched", () => {
		it("dispatches a NotificationAction.removeByActivityIds with all child activityIds", () => {
			const activities = {
				A: createActivity({ id: "A" }),
				B: createActivity({ id: "B", initiatingActivityId: "A" }),
				C: createActivity({ id: "C", initiatingActivityId: "A" })
			};

			const store = createStoreForTest({ initialState: { activities } });

			removeNotificationsByActivityCloseMiddleware(store)(x => x)(
				ActivityActions.cancel({ activityId: "A" })
			);

			const expectedAction = NotificationActions.removeByActivityIds(["A", "B", "C"]);

			const actualAction = store.getActions().find(a => a.type === expectedAction.type);
			deepStrictEqual(actualAction, expectedAction);
		});
	});
});
