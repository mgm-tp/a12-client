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
import { testSaga } from "redux-saga-test-plan";

import type { Activity } from "../../../../core/activity/index.js";
import { ActivityActions } from "../../../../core/activity/index.js";
import errorHandlingSagas from "../../../../core/application/internal/sagas/errorHandling.js";

describe("core.application", () => {
	describe("error handling", () => {
		describe("saveActivityFailedSaga", () => {
			const dummyParams: ActivityActions.ActivityActionPayload = {
				activityId: "dummyActivityId"
			};
			const dummyError = new Error("dummy");

			describe("canHandle", () => {
				it("returns true when called with an ActivityActions.save.failed action", () => {
					const saveFailedAction = ActivityActions.save.failed({
						error: dummyError,
						params: dummyParams
					});

					strictEqual(
						errorHandlingSagas.saveActivityFailedSaga().canHandle({}, saveFailedAction),
						true
					);
				});

				it("returns true when called with an ActivityActions.commit.failed action", () => {
					const commitFailedAction = ActivityActions.commit.failed({
						error: dummyError,
						params: dummyParams
					});

					strictEqual(
						errorHandlingSagas.saveActivityFailedSaga().canHandle({}, commitFailedAction),
						true
					);
				});

				it("returns false when called with an action not matching save.failed and commit.failed", () => {
					const anyAction: Action = { type: "DummyAction" };

					strictEqual(errorHandlingSagas.saveActivityFailedSaga().canHandle({}, anyAction), false);
				});
			});

			describe("handle", () => {
				describe("given an error in the action payload which is an instance of Activity.Error.Base", () => {
					it("dispatches an ActivityActions.error action with the given error in the payload", () => {
						const baseError: Activity.Error.Base = {
							errorCode: "dummyBaseError"
						};
						const saveFailedAction = ActivityActions.save.failed({
							error: baseError,
							params: dummyParams
						});

						const expectedAction = ActivityActions.error({
							activityId: dummyParams.activityId,
							operationType: "saving",
							error: baseError
						});

						testSaga(errorHandlingSagas.saveActivityFailedSaga().handle, saveFailedAction)
							.next()
							.put(expectedAction)
							.next()
							.isDone();
					});
				});

				describe("given an error in the action payload which is not an instance of Activity.Error.Base", () => {
					it(
						"dispatches an ActivityActions.error action with the given error " +
							"wrapped into a Activity.Error.Save error",
						() => {
							const saveFailedAction = ActivityActions.save.failed({
								error: dummyError,
								params: dummyParams
							});

							const expectedError: Activity.Error.Saving = {
								errorCode: "SAVING_FAILED_ERROR",
								content: dummyError
							};

							const expectedAction = ActivityActions.error({
								activityId: dummyParams.activityId,
								operationType: "saving",
								error: expectedError
							});

							testSaga(errorHandlingSagas.saveActivityFailedSaga().handle, saveFailedAction)
								.next()
								.put(expectedAction)
								.next()
								.isDone();
						}
					);
				});
			});
		});
	});
});
