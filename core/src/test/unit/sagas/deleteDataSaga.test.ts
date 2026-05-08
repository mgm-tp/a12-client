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
