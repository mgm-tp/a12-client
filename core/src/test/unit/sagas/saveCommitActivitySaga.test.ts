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

import { ok, partialDeepStrictEqual, strictEqual } from "node:assert/strict";

import type { Action } from "redux";
import { put } from "typed-redux-saga";

import { ActivityActions, ActivitySelectors } from "../../../core/activity/index.js";
import {
	commitStartActivitySaga,
	saveActivitySaga
} from "../../../core/application/internal/sagas/data/save.js";
import type { DataProvider } from "../../../core/data/internal/DataProvider.js";
import { createGeneralStore } from "../../mocks/store/store.js";
import { createActivity, createDataHolder } from "../../utils/activity.js";

describe("core.application.internal.sagas.data", () => {
	const saveActivityId = "forSave";
	const commitActivityId = "forCommit";

	function createStore(...dataProviders: DataProvider[]) {
		const activity = createActivity({
			id: commitActivityId,
			descriptor: { type: "commit" },
			dataHolders: [
				createDataHolder({ loadingState: "loaded", descriptor: { type: "commit" }, dirty: true })
			]
		});

		const activity2 = createActivity({
			id: saveActivityId,
			descriptor: { type: "save" },
			dataHolders: [
				createDataHolder({ loadingState: "loaded", descriptor: { type: "save" }, dirty: true }),
				createDataHolder({ loadingState: "loaded", descriptor: { type: "T1" }, dirty: false }),
				createDataHolder({ loadingState: "loaded", descriptor: { type: "T2" }, dirty: true }),
				createDataHolder({ loadingState: "loaded", descriptor: { type: "T3" }, dirty: false }),
				createDataHolder({ loadingState: "loaded", descriptor: { type: "T4" }, dirty: true }),
				createDataHolder({ loadingState: "loaded", descriptor: { type: "T5" }, dirty: false }),
				createDataHolder({ loadingState: "loaded", descriptor: { type: "T6" }, dirty: true })
			]
		});

		return createGeneralStore({
			activities: [activity, activity2],
			dataHandlers: dataProviders
		});
	}

	describe("saveActivitySaga", () => {
		describe("canHandle", () => {
			it("returns true, when the action is from type ActivityActions.save.started", () => {
				const action = ActivityActions.save.started({ activityId: saveActivityId });
				strictEqual(saveActivitySaga({ dataHandlers: [] }).canHandle({}, action), true);
			});

			it("returns false for any other action", () => {
				const action: Action = { type: "EmptyAction" };
				strictEqual(saveActivitySaga({ dataHandlers: [] }).canHandle({}, action), false);
			});
		});

		describe("handle", () => {
			const dp: DataProvider = {
				name: "saveDp",
				canHandle: config => config.operation === "save" && config.activityId === saveActivityId,
				*provideData(config: DataProvider.SaveConfig) {
					const { saving, ...rest } = config.details;

					yield* put(ActivityActions.setData({ activityId: saveActivityId, data: rest }));
					yield* put(saving.done({}));
				}
			};

			describe("given an ActivityActions.save.started", () => {
				it("calls the data provider with updateActivityData=true in the save config details", async () => {
					const { store, waitFor } = createStore(dp);

					store.dispatch(ActivityActions.save.started({ activityId: saveActivityId }));

					await waitFor(s => {
						strictEqual(ActivitySelectors.savingStateById(saveActivityId)(s), "saved");

						const data = ActivitySelectors.data(saveActivityId)(store.getState());
						partialDeepStrictEqual(data, { updateActivityData: true });
					});
				});

				it("passes action payload without activityId in provider config", async () => {
					const { store, waitFor } = createStore(dp);
					const additionalPayload = { key: "value", some: "other" };
					store.dispatch(
						ActivityActions.save.started({ activityId: saveActivityId, ...additionalPayload })
					);

					await waitFor(s => {
						strictEqual(ActivitySelectors.savingStateById(saveActivityId)(s), "saved");

						const data = ActivitySelectors.data(saveActivityId)(s);
						partialDeepStrictEqual(data, additionalPayload);
					});
				});

				it("calls the data provider for the default dh only", async () => {
					const { store, waitFor } = createStore(dp);

					store.dispatch(ActivityActions.save.started({ activityId: saveActivityId }));

					await waitFor(s => {
						const dataHolders = ActivitySelectors.activityPropById(
							saveActivityId,
							a => a.dataHolders
						)(s);
						ok(dataHolders);

						const shouldBeSaved = ["save"];

						dataHolders.forEach(({ descriptor, savingState }) => {
							strictEqual(
								savingState,
								shouldBeSaved.includes(descriptor.type!) ? "saved" : "not_saved"
							);
						});
					});
				});

				it("calls the data provider only for the ones specified by descriptor", async () => {
					const { store, waitFor } = createStore(dp);

					store.dispatch(
						ActivityActions.save.started({
							activityId: saveActivityId,
							dataHolderDescriptors: [{ type: "T2" }, { type: "T4" }]
						})
					);

					await waitFor(s => {
						const dataHolders = ActivitySelectors.activityPropById(
							saveActivityId,
							a => a.dataHolders
						)(s);
						ok(dataHolders);

						const shouldBeSaved = ["T2", "T4"];

						dataHolders.forEach(({ descriptor, savingState }) => {
							strictEqual(
								savingState,
								shouldBeSaved.includes(descriptor.type!) ? "saved" : "not_saved"
							);
						});
					});
				});
			});
		});
	});

	describe("commitStartActivitySaga", () => {
		describe("canHandle", () => {
			it("returns true, when the action is from type ActivityActions.commit.started", () => {
				const action = ActivityActions.commit.started({ activityId: commitActivityId });
				strictEqual(commitStartActivitySaga({ dataHandlers: [] }).canHandle({}, action), true);
			});

			it("returns false for any other action", () => {
				const action: Action = { type: "EmptyAction" };
				strictEqual(commitStartActivitySaga({ dataHandlers: [] }).canHandle({}, action), false);
			});
		});

		describe("handle", () => {
			describe("given an ActivityActions.commit.started", () => {
				it("calls the data provider with updateActivityData=false in the save config details", async () => {
					const dp: DataProvider = {
						name: "commitDp",
						canHandle: config =>
							config.operation === "save" && config.activityId === commitActivityId,
						*provideData(config: DataProvider.SaveConfig) {
							const { saving, ...rest } = config.details;

							if (!rest.updateActivityData) {
								yield* put(saving.done({}));
							}
						}
					};

					const { store, waitFor } = createStore(dp);
					store.dispatch(ActivityActions.commit.started({ activityId: commitActivityId }));

					await waitFor(s => {
						const activity = ActivitySelectors.activityById(commitActivityId)(s);
						strictEqual(activity, undefined);
					});
				});

				// commitStartActivitySaga calls handleSaveActivity, therefore remaining tests are done for saveActivitySaga
			});
		});
	});
});
