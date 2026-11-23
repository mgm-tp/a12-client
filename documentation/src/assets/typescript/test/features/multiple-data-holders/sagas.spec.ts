// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
