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
