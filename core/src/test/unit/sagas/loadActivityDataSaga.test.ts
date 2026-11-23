// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { partialDeepStrictEqual, strictEqual } from "node:assert/strict";

import type { Action } from "redux";
import { delay, put } from "typed-redux-saga";

import type { Activity } from "../../../core/activity/index.js";
import { ActivityActions, ActivitySelectors } from "../../../core/activity/index.js";
import { loadActivityDataSaga } from "../../../core/application/internal/sagas/data/load.js";
import type { DataProvider } from "../../../core/data/index.js";
import { createGeneralStore } from "../../mocks/store/store.js";
import { createActivity, createDataHolder } from "../../utils/activity.js";

describe("core.application.internal.sagas.data", () => {
	const activityId = "loadId";

	function createStore(...dataProviders: DataProvider[]) {
		const activity = createActivity({
			id: activityId,
			descriptor: { type: "load" },
			dataHolders: [
				createDataHolder({ loadingState: "missing", dirty: true, descriptor: { type: "load" } })
			]
		});

		return createGeneralStore({
			activities: [activity],
			dataHandlers: dataProviders
		});
	}

	describe("loadActivityDataSaga", () => {
		describe("canHandle", () => {
			it("returns true, when the action is from type ActivityActions.loadData", () => {
				const action = ActivityActions.loadData({ activityId });
				strictEqual(loadActivityDataSaga({ dataHandlers: [] }).canHandle({}, action), true);
			});

			it("returns false for any other action", () => {
				const action: Action = { type: "EmptyAction" };
				strictEqual(loadActivityDataSaga({ dataHandlers: [] }).canHandle({}, action), false);
			});
		});

		describe("handle", () => {
			interface Data {
				readonly count?: number;
			}

			describe("given an ActivityActions.loadData", () => {
				it("calls the data provider only once for every data holder if the data provider already handles this data holder", async () => {
					let count = 0;
					const dp: DataProvider = {
						name: "loadDp",
						canHandle: config => config.operation === "load" && config.activityId === activityId,
						*provideData(config) {
							yield* delay(1);

							yield* put(
								ActivityActions.setData({
									activityId: config.activityId,
									data: { count: ++count }
								})
							);
						}
					};

					const { store, waitFor } = createStore(dp);

					store.dispatch(ActivityActions.loadData({ activityId }));
					store.dispatch(ActivityActions.loadData({ activityId }));

					await waitFor(s => {
						strictEqual(ActivitySelectors.loadingStateById(activityId)(s), "loaded");

						const data = ActivitySelectors.data(activityId)(store.getState()) as Data;
						strictEqual(data.count, 1);
					});
				});

				it("calls the data provider every time for every data holder if the data provider finished before next call", async () => {
					let count = 0;
					const dp: DataProvider = {
						name: "forLoadDp",
						canHandle: config => config.operation === "load" && config.activityId === activityId,
						*provideData(config) {
							yield* put(
								ActivityActions.setData({
									activityId: config.activityId,
									data: { count: ++count }
								})
							);
						}
					};

					const { store, waitFor } = createStore(dp);

					store.dispatch(ActivityActions.loadData({ activityId }));
					store.dispatch(ActivityActions.loadData({ activityId }));

					await waitFor(s => {
						strictEqual(ActivitySelectors.loadingStateById(activityId)(s), "loaded");

						const data = ActivitySelectors.data(activityId)(store.getState()) as Data;
						strictEqual(data.count, 2);
					});
				});

				it("calls the data provider every time for every data holder if the data provider finished with an error before next call", async () => {
					let count = 0;
					const dp: DataProvider = {
						name: "forLoadDp",
						canHandle: config => config.operation === "load" && config.activityId === activityId,
						*provideData() {
							throw new Error(`load error ${++count}`);
						}
					};

					const { store, waitFor } = createStore(dp);

					store.dispatch(ActivityActions.loadData({ activityId }));
					store.dispatch(ActivityActions.loadData({ activityId }));

					await waitFor(s => {
						strictEqual(ActivitySelectors.loadingStateById(activityId)(s), "error");

						const err = ActivitySelectors.error(activityId)(
							store.getState()
						) as Activity.Error.InternalClient;

						strictEqual(err.message, "load error 2");
					});
				});

				it("passes action payload without activityId in provider config", async () => {
					const dp: DataProvider = {
						name: "loadDp",
						canHandle: config => config.operation === "load" && config.activityId === activityId,
						*provideData(config: DataProvider.LoadConfig) {
							yield* put(
								ActivityActions.setData({
									activityId: config.activityId,
									data: config
								})
							);
						}
					};

					const { store, waitFor } = createStore(dp);

					const additionalPayload = { key: "value", some: "other" };
					store.dispatch(ActivityActions.loadData({ activityId, ...additionalPayload }));

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
