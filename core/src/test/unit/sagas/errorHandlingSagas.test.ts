// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual, strictEqual } from "node:assert/strict";
import { mock } from "node:test";

import { expectSaga } from "redux-saga-test-plan";
import { put } from "redux-saga/effects";
import type { Action, Failure } from "typescript-fsa";

import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging/index.js";

import { ActivityActions } from "../../../core/activity/index.js";
import type { ApplicationSaga } from "../../../core/application/index.js";
import ErrorHandling from "../../../core/application/internal/sagas/errorHandling.js";

function* dispatchHandleHelper(saga: ApplicationSaga.Descriptor, action: Action<{}>) {
	yield saga.handle(action);
}
function canHandleHelper(saga: ApplicationSaga.Descriptor, action: Action<{}>): boolean {
	return saga.canHandle({}, action);
}

const clearErrorPayload: ActivityActions.ActivityActionPayload = {
	activityId: "1"
};

describe("core.application.internal.sagas.errorHandling", () => {
	describe("logActivityErrorSaga", () => {
		const errorPayload: ActivityActions.ErrorPayload = {
			activityId: "1",
			error: "Custom test error! Please fix this!",
			operationType: "loading"
		};

		describe("canHandle", () => {
			describe("given an action matching ActivityActions.error dispatched to the store", () => {
				it("returns true", () => {
					strictEqual(
						canHandleHelper(
							ErrorHandling.logActivityErrorSaga(),
							ActivityActions.error(errorPayload)
						),
						true
					);
				});
			});
			describe("given an action not matching ActivityActions.error dispatched to the store", () => {
				it("returns false", () => {
					strictEqual(
						canHandleHelper(
							ErrorHandling.logActivityErrorSaga(),
							ActivityActions.clearError(clearErrorPayload)
						),
						false
					);
				});
			});
		});
		describe("handle", () => {
			describe("given an action matching ActivityActions.error dispatched to the store", () => {
				it("logs the error and the ID of the error action", async () => {
					const logger = LoggerFactory.getLogger("core/application");
					const logSpy = mock.method(logger, "error");

					return expectSaga(
						dispatchHandleHelper,
						ErrorHandling.logActivityErrorSaga(),
						ActivityActions.error(errorPayload)
					)
						.run()
						.then(() => {
							strictEqual(logSpy.mock.callCount(), 1);

							const args = logSpy.mock.calls.at(0)?.arguments;

							strictEqual(args?.length, 2);

							const errorLogArgument1 = args[0];
							strictEqual(typeof errorLogArgument1, "string");
							strictEqual(errorLogArgument1.includes(errorPayload.activityId), true);

							const errorLogArgument2 = args[1];
							strictEqual(errorLogArgument2, errorPayload.error);
						});
				});
			});
		});
	});

	describe("saveActivityFailedSaga", () => {
		const errorPayload: Failure<ActivityActions.ActivityActionPayload, any> = {
			params: {
				activityId: "1"
			},
			error: "Custom test error! Please fix this!"
		};

		describe("canHandle", () => {
			describe("given an action matching ActivityActions.save.failed dispatched to the store", () => {
				it("returns true", () => {
					strictEqual(
						canHandleHelper(
							ErrorHandling.saveActivityFailedSaga(),
							ActivityActions.save.failed(errorPayload)
						),
						true
					);
				});
			});
			describe("given an action matching ActivityActions.commit.failed dispatched to the store", () => {
				it("returns true", async () => {
					strictEqual(
						canHandleHelper(
							ErrorHandling.saveActivityFailedSaga(),
							ActivityActions.commit.failed(errorPayload)
						),
						true
					);
				});
			});

			describe(
				"given an action not matching ActivityActions.save.failed or " +
					" ActivityActions.commit.failed dispatched to the store",
				() => {
					it("returns false", () => {
						strictEqual(
							canHandleHelper(
								ErrorHandling.saveActivityFailedSaga(),
								ActivityActions.clearError(clearErrorPayload)
							),
							false
						);
					});
				}
			);
		});

		describe("handle", () => {
			describe("given an action matching ActivityActions.commit.failed dispatched to the store", () => {
				it(
					"dispatches an ActivityActions.error action using the payload from the original action" +
						"and operationType = saving",
					async () => {
						const expectedAction: Action<{}> = ActivityActions.error({
							activityId: errorPayload.params.activityId,
							error: {
								errorCode: "SAVING_FAILED_ERROR",
								content: errorPayload.error
							},
							operationType: "saving"
						});
						return expectSaga(
							dispatchHandleHelper,
							ErrorHandling.saveActivityFailedSaga(),
							ActivityActions.commit.failed(errorPayload)
						)
							.run()
							.then(result => {
								const { effects } = result;
								strictEqual(effects.put.length, 1, "Expected that have action is dispatched");

								deepStrictEqual(effects.put[0], put(expectedAction));
							});
					}
				);
			});

			describe("given an action matching ActivityActions.save.failed dispatched to the store", () => {
				it(
					"dispatches an ActivityActions.error action using the payload from the original action" +
						"and operationType = saving",
					async () => {
						const expectedAction: Action<{}> = ActivityActions.error({
							activityId: errorPayload.params.activityId,
							error: {
								errorCode: "SAVING_FAILED_ERROR",
								content: errorPayload.error
							},
							operationType: "saving"
						});
						return expectSaga(
							dispatchHandleHelper,
							ErrorHandling.saveActivityFailedSaga(),
							ActivityActions.save.failed(errorPayload)
						)
							.run()
							.then(result => {
								const { effects } = result;
								strictEqual(effects.put.length, 1, "Expected that have action is dispatched");

								deepStrictEqual(effects.put[0], put(expectedAction));
							});
					}
				);
			});
		});
	});
});
