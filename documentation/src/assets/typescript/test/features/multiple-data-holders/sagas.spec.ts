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

// tag::content[]

import { deepStrictEqual } from "node:assert/strict";
import { mock } from "node:test";

import type { Action } from "redux";
import { runSaga } from "redux-saga";

import type { ActivityMap } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ActivitySagas } from "@com.mgmtp.a12.client/client-core";

import { handleInitializeDataHolders } from "./saga.js";
import { createActivity } from "./testUtils.js";

describe("@com.mgmtp.a12.client.devapp.features.multiple-data-holders", () => {
	describe("initializeDataHoldersSaga", () => {
		describe("When a push action is dispatched with a given activityId", () => {
			const payload = {
				activityId: "1",
				activityDescriptor: { feature: "MultipleDataHolders" }
			};
			const pushAction = ActivityActions.create({
				...payload
			});

			const dispatched: object[] = [];

			// oxlint-disable-next-line typescript/no-explicit-any
			function setupAndRunSaga(state: any = { activities: {} }): Promise<any> {
				return runSaga(
					{
						dispatch(action: Action) {
							dispatched.push(action);
						},
						getState() {
							return state;
						}
					},
					handleInitializeDataHolders,
					pushAction
				).toPromise();
			}

			beforeEach(() => {
				dispatched.length = 0;
			});

			describe("When store contains an empty activity map", () => {
				it("dispatches a commit started activity with the given activity id", async () => {
					await setupAndRunSaga();

					deepStrictEqual(dispatched, [
						{
							type: ActivityActions.commit.started.type,
							payload: payload
						}
					]);
				});
			});

			describe(
				"When store contains some activities where one of them is dependent " +
					"on the activity for the given activityId",
				() => {
					it("dispatches a commit started activity with the given activity id", async () => {
						mock.method(ActivitySagas, "waitForResponseCancelRequested", function* () {
							return true;
						});

						const activities: ActivityMap = {
							1: createActivity({ id: "1" }),
							2: createActivity({ id: "2", initiatingActivityId: "1" })
						};

						await setupAndRunSaga({ activities });

						deepStrictEqual(dispatched, [
							{
								type: ActivityActions.cancelRequested.type,
								payload: { activityIds: ["2"] }
							},
							{
								type: ActivityActions.commit.started.type,
								payload: payload
							}
						]);
					});
				}
			);
		});
	});
});
// end::content[]
