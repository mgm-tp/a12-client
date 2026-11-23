// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { partialDeepStrictEqual, strictEqual } from "node:assert/strict";

import type { Action } from "redux";
import { put } from "typed-redux-saga";

import { ActivityActions, ActivitySelectors } from "../../../core/activity/index.js";
import { deleteDataSaga } from "../../../core/application/internal/sagas/data/delete.js";
import type { DataProvider } from "../../../core/data/index.js";
import { createGeneralStore } from "../../mocks/store/store.js";
import { createActivity, createDataHolder } from "../../utils/activity.js";

describe("core.application.internal.sagas.data", () => {
	const activityId = "deleteId";

	function createStore() {
		const activity = createActivity({
			id: activityId,
			descriptor: { type: "delete" },
			dataHolders: [
				createDataHolder({
					loadingState: "loaded",
					data: { some: "thing" },
					descriptor: { type: "delete" }
				})
			]
		});

		return createGeneralStore({
			activities: [activity],
			dataHandlers: [
				{
					name: "deleteDP",
					canHandle: config => config.operation === "delete" && config.activityId === activityId,
					*provideData(config) {
						yield* put(
							ActivityActions.setData({
								activityId: config.activityId,
								data: config
							})
						);
					}
				} satisfies DataProvider
			]
		});
	}

	describe("deleteDataSaga", () => {
		describe("canHandle", () => {
			it("returns true, when the action is from type ActivityActions.removeData", () => {
				const action = ActivityActions.removeData({ activityId, instanceId: "B" });
				strictEqual(deleteDataSaga({ dataHandlers: [] }).canHandle({}, action), true);
			});

			it("returns false for any other action", () => {
				const action: Action = { type: "EmptyAction" };
				strictEqual(deleteDataSaga({ dataHandlers: [] }).canHandle({}, action), false);
			});
		});

		describe("handle", () => {
			describe("given an ActivityActions.removeData", () => {
				describe("with additional payload data", () => {
					it("passes action payload without activityId in provider config", async () => {
						const { store, waitFor } = createStore();

						const additionalPayload = { instanceId: "value", some: "other" };
						store.dispatch(ActivityActions.removeData({ activityId, ...additionalPayload }));

						await waitFor(s => {
							strictEqual(ActivitySelectors.loadingStateById(activityId)(s), "loaded");

							const data = ActivitySelectors.data(activityId)(store.getState());
							partialDeepStrictEqual(data, { details: additionalPayload });
						});
					});
				});
			});
		});
	});
});
