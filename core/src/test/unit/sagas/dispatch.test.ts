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
import { mock } from "node:test";

import type { Action as ReduxAction } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import { call, put, race, take } from "redux-saga/effects";
import type { SagaGenerator } from "typed-redux-saga";

import type { Action } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";

import type { Activity, ActivityActions } from "../../../core/activity/index.js";
import type { ApplicationSaga } from "../../../core/application/index.js";
import watchDispatchSaga from "../../../core/application/internal/sagas/dispatch.js";
import { createActivity } from "../../utils/activity.js";

const handleStub1 = mock.fn();
const handleStub2 = mock.fn();
const handleStub3 = mock.fn();
const dummyAction: Action<{}> = { type: "SAGA_DONE", payload: {} };

describe("core.application.internal.sagas.dispatch", () => {
	afterEach(() => {
		handleStub1.mock.resetCalls();
		handleStub2.mock.resetCalls();
		handleStub3.mock.resetCalls();
	});

	describe("given any action", () => {
		it("takes every action", () => {
			return expectSaga(sagaWrapper)
				.withState({ activities: {} })
				.dispatch(dummyAction)
				.run()
				.then(result => {
					const { effects } = result;

					strictEqual(effects.take.length, 3);
					strictEqual(effects.fork.length, 2);

					const forkArgs = effects.fork[0].payload.args;
					strictEqual(forkArgs[1].name, "dispatch");
					strictEqual(forkArgs[2].length, 3);
				});
		});
	});

	describe("given an action which contains an activityDescriptor", () => {
		it("gets the activity descriptor and selects the first saga based on this descriptor", () => {
			const emptyAction: Action<{}> = {
				type: "Activity/EmptyAction",
				payload: { activityDescriptor: { model: "TestModel" } }
			};

			return expectSaga(sagaWrapper)
				.withState({ activities: {} })
				.dispatch(emptyAction)
				.run()
				.then(() => {
					strictEqual(handleStub1.mock.callCount(), 1);
					strictEqual(handleStub2.mock.callCount(), 0);
					strictEqual(handleStub3.mock.callCount(), 0);
				});
		});
	});

	describe("given an action which does not contain an activityDescriptor", () => {
		describe("which contains an activity id", () => {
			it(
				"gets the activity from the store and uses the descriptor, if the activity contains one, " +
					"to select the first matching saga",
				() => {
					const emptyAction: Action<{}> = {
						type: "Activity/EmptyAction",
						payload: { id: "A" }
					};

					return expectSaga(sagaWrapper)
						.withState({
							activities: {
								A: createActivity({ id: "A", descriptor: { model: "TestModel" } })
							}
						})
						.dispatch(emptyAction)
						.run()
						.then(() => {
							strictEqual(handleStub1.mock.callCount(), 1);
							strictEqual(handleStub2.mock.callCount(), 0);
							strictEqual(handleStub3.mock.callCount(), 0);
						});
				}
			);

			it(
				"gets the activity from the store and uses an empty model, if the activity contains no descriptor, " +
					"to select the first matching saga",
				() => {
					const emptyAction: Action<{}> = {
						type: "Activity/SpecialEmptyAction",
						payload: { id: "A" }
					};

					return expectSaga(sagaWrapper)
						.withState({
							activities: {
								A: createActivity({ id: "A" })
							}
						})
						.dispatch(emptyAction)
						.run()
						.then(() => {
							strictEqual(handleStub1.mock.callCount(), 0);
							strictEqual(handleStub2.mock.callCount(), 0);
							strictEqual(handleStub3.mock.callCount(), 1);
						});
				}
			);
		});

		describe("which contains no activity id", () => {
			it("selects the latest activity from the store", () => {
				const emptyAction: Action<{}> = {
					type: "Activity/EmptyAction",
					payload: {}
				};

				return expectSaga(sagaWrapper)
					.withState({
						activities: {
							A: createActivity({ id: "A", descriptor: { model: "TestModel" } })
						}
					})
					.dispatch(emptyAction)
					.run()
					.then(() => {
						strictEqual(handleStub1.mock.callCount(), 1);
						strictEqual(handleStub2.mock.callCount(), 0);
						strictEqual(handleStub3.mock.callCount(), 0);
					});
			});
		});
	});
});

/**
 * a wrapper to simulate a race between the real saga and a fake saga, which gets
 * called, when the handle method of one of the dummy sagas is called.
 * This is necessary, because watchDispatchSaga never ends otherwise and we would
 * always have to wait for a timeout.
 */

function* sagaWrapper() {
	yield race({
		sagaToTest: call(watchDispatchSaga, [testSaga3(), testSaga1(), testSaga2()]),
		cancel: call(dummySaga)
	});
}

function* dummySaga(sagas: ApplicationSaga.Descriptor[] = []): SagaGenerator<void> {
	yield take((a: ReduxAction) => a.type === dummyAction.type);
}

function testSaga1(): ApplicationSaga.Descriptor {
	return {
		canHandle: (ad: Activity.Descriptor, action: Action<{}>) => {
			return ad.model === "TestModel";
		},
		*handle(action: Action<ActivityActions.CancelRequestedPayload>) {
			handleStub1();
			yield put(dummyAction);
		}
	};
}

function testSaga2(): ApplicationSaga.Descriptor {
	return {
		canHandle: (ad: Activity.Descriptor, action: Action<{}>) => {
			return ad.model === "TestModel";
		},
		*handle(action: Action<ActivityActions.CancelRequestedPayload>) {
			handleStub2();
		}
	};
}

function testSaga3(): ApplicationSaga.Descriptor {
	return {
		canHandle: (ad: Activity.Descriptor, action: Action<{}>) => {
			return action.type === "Activity/SpecialEmptyAction";
		},
		*handle(action: Action<ActivityActions.CancelRequestedPayload>) {
			handleStub3();
			yield put(dummyAction);
		}
	};
}
