// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";

import type { AnyAction } from "redux";
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
					const anyAction: AnyAction = { type: "DummyAction" };

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
