// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";

import type { Action } from "redux";
import { put } from "typed-redux-saga";

import { ActivityActions, ActivitySelectors } from "../../../core/activity/index.js";
import { reloadActivityDataSaga } from "../../../core/application/internal/sagas/data/reload.js";
import type { DataProvider } from "../../../core/data/index.js";
import { createGeneralStore } from "../../mocks/store/store.js";
import { createActivity, createDataHolder } from "../../utils/activity.js";

describe("core.application.internal.sagas.data", () => {
	const activityId = "reloadId";

	interface Data {
		readonly count?: number;
	}

	function createStore() {
		const activity = createActivity({
			id: activityId,
			descriptor: { type: "reload" },
			dataHolders: [createDataHolder({ loadingState: "loaded", descriptor: { type: "reload" } })]
		});

		let count = 0;

		return createGeneralStore({
			activities: [activity],
			dataHandlers: [
				{
					name: "loadDp",
					canHandle: config => config.operation === "load" && config.activityId === activityId,
					*provideData(config) {
						yield* put(
							ActivityActions.setData({
								activityId: config.activityId,
								data: { count: ++count }
							})
						);
					}
				} satisfies DataProvider
			]
		});
	}

	describe("reloadDataSaga", () => {
		describe("canHandle", () => {
			it("returns true, when the action is from type ActivityActions.reloadData", () => {
				const action = ActivityActions.reloadData({ activityId });
				strictEqual(reloadActivityDataSaga().canHandle({}, action), true);
			});

			it("returns false for any other action", () => {
				const action: Action = { type: "EmptyAction" };
				strictEqual(reloadActivityDataSaga().canHandle({}, action), false);
			});
		});

		describe("handle", () => {
			describe("given an ActivityActions.reloadData", () => {
				it("dispatches a ActivityActions.loadData action to trigger the reload", async () => {
					const { store, waitFor } = createStore();

					store.dispatch(ActivityActions.reloadData({ activityId }));

					await waitFor(s => {
						strictEqual(ActivitySelectors.loadingStateById(activityId)(s), "loaded");

						const data = ActivitySelectors.data(activityId)(store.getState()) as Data;
						strictEqual(data.count, 1);
					});
				});
			});
		});
	});
});
