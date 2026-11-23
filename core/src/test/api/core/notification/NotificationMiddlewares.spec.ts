// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
