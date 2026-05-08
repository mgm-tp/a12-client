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

import { deepStrictEqual, notDeepStrictEqual, strictEqual } from "node:assert/strict";

import { expectSaga } from "redux-saga-test-plan";
import { put } from "redux-saga/effects";
import type { Action, AnyAction } from "typescript-fsa";

import type { Activity } from "../../../core/activity/index.js";
import { ActivityActions } from "../../../core/activity/index.js";
import type { ApplicationSaga } from "../../../core/application/index.js";
import { dirtyHandlingSaga } from "../../../extensions/dirtyHandling/internal/dirtyHandling.js";
import { createGeneralStore } from "../../mocks/store/store.js";
import { createActivity } from "../../utils/activity.js";

function* dispatchHelper(saga: ApplicationSaga.Descriptor, action: Action<unknown>) {
	yield saga.handle(action);
}

describe("extensions.dirtyHandling.internal.dirtyHandling", () => {
	describe("dirtyHandlingSaga", () => {
		describe("Given an activity A", () => {
			describe("which is not dirty", () => {
				it("cancels A", async () => {
					const cancelRequestedAction = ActivityActions.cancelRequested({
						activityIds: ["A"]
					});

					const activityMock = createNewActivity({
						id: "A",
						activationTimestamp: 1000
					});
					const activities = [activityMock];
					const expectedActions: Action<{}>[] = [
						ActivityActions.cancel({ activityId: "A" }),
						ActivityActions.responseCancelRequested({ cancelled: true })
					];

					return expectSaga(dispatchHelper, dirtyHandlingSaga(), cancelRequestedAction)
						.withState(createStoreForTesting(activities))
						.run()
						.then(result => {
							const { effects } = result;

							notDeepStrictEqual(effects.put, undefined, "Put effects were expected");
							strictEqual(effects.put.length, expectedActions.length);

							for (let i = 0; i < expectedActions.length; i++) {
								deepStrictEqual(effects.put[i], put(expectedActions[i]));
							}
						});
				});
			});

			describe("for which one data holder, which is not the activity data holder, is dirty", () => {
				it("fires one setCancelConfirmationRequired action and cancels A if noVeto gets returned", async () => {
					const cancelRequestedAction = ActivityActions.cancelRequested({
						activityIds: ["A"]
					});

					const anyDataHolder = {
						descriptor: { model: "anotherDataHolder" },
						data: {},
						dirty: true,
						loadingState: "missing",
						savingState: "not_saved",
						slices: {}
					} as Activity.DataHolder;

					const activityMock = createNewActivity({
						id: "A",
						activationTimestamp: 1000,
						dataHolders: [anyDataHolder]
					});

					const activities = [activityMock];
					const expectedActions: Action<{}>[] = [
						ActivityActions.setCancelConfirmationRequired({
							activityId: "A",
							cancelConfirmationRequired: true
						}),
						ActivityActions.cancel({ activityId: "A" }),
						ActivityActions.responseCancelRequested({ cancelled: true })
					];
					return expectSaga(dispatchHelper, dirtyHandlingSaga(), cancelRequestedAction)
						.withState(createStoreForTesting(activities))
						.dispatch(
							ActivityActions.responseCancelConfirmation({
								activityId: "A",
								veto: false
							})
						)
						.run()
						.then(result => {
							const { effects } = result;

							notDeepStrictEqual(effects.put, undefined, "Put effects were expected");
							strictEqual(effects.put.length, expectedActions.length);

							for (let i = 0; i < expectedActions.length; i++) {
								deepStrictEqual(effects.put[i], put(expectedActions[i]));
							}
						});
				});

				it("fires one setCancelConfirmationRequired action and does not cancel A if veto gets returned", async () => {
					const cancelRequestedAction = ActivityActions.cancelRequested({
						activityIds: ["A"]
					});

					const anyDataHolder = {
						descriptor: { model: "anotherDataHolder" },
						data: {},
						dirty: true,
						loadingState: "missing",
						savingState: "not_saved",
						slices: {}
					} as Activity.DataHolder;

					const activityMock = createNewActivity({
						id: "A",
						activationTimestamp: 1000,
						dataHolders: [anyDataHolder]
					});

					const activities = [activityMock];
					const expectedActions: Action<{}>[] = [
						ActivityActions.setCancelConfirmationRequired({
							activityId: "A",
							cancelConfirmationRequired: true
						}),
						ActivityActions.responseCancelRequested({ cancelled: false })
					];
					return expectSaga(dispatchHelper, dirtyHandlingSaga(), cancelRequestedAction)
						.withState(createStoreForTesting(activities))
						.dispatch(
							ActivityActions.responseCancelConfirmation({
								activityId: "A",
								veto: true
							})
						)
						.run()
						.then(result => {
							const { effects } = result;

							notDeepStrictEqual(effects.put, undefined, "Put effects were expected");
							strictEqual(effects.put.length, expectedActions.length);

							for (let i = 0; i < expectedActions.length; i++) {
								deepStrictEqual(effects.put[i], put(expectedActions[i]));
							}
						});
				});
			});

			describe("which is not in the store", () => {
				it("dispatches only the response action", async () => {
					const cancelRequestedAction = ActivityActions.cancelRequested({
						activityIds: ["A"]
					});

					const activityMock = createNewActivity({
						id: "B",
						activationTimestamp: 1000,
						dirtyStateOfActivityDataHolder: true
					});
					const activities = [activityMock];

					const expectedActions: Action<{}>[] = [
						ActivityActions.responseCancelRequested({ cancelled: true })
					];

					return expectSaga(dispatchHelper, dirtyHandlingSaga(), cancelRequestedAction)
						.withState(createStoreForTesting(activities))
						.run()
						.then(result => {
							const { effects } = result;

							strictEqual(effects.put.length, expectedActions.length);

							for (let i = 0; i < expectedActions.length; i++) {
								deepStrictEqual(effects.put[i], put(expectedActions[i]));
							}
						});
				});
			});
		});

		describe("Given two activities A and B in the store", () => {
			describe("which are not related", () => {
				describe("and using A and B as payloads for cancelRequested activityIds", () => {
					describe("with A != dirty and B != dirty", () => {
						it("cancels A and B", async () => {
							const cancelRequestedAction = ActivityActions.cancelRequested({
								activityIds: ["A", "B"]
							});

							const activityMockA = createNewActivity({
								id: "A",
								activationTimestamp: 1000
							});
							const activityMockB = createNewActivity({
								id: "B",
								activationTimestamp: 1000
							});
							const activities = [activityMockA, activityMockB];

							const expectedActions: Action<{}>[] = [
								ActivityActions.cancel({ activityId: "A" }),
								ActivityActions.cancel({ activityId: "B" }),
								ActivityActions.responseCancelRequested({ cancelled: true })
							];

							return expectSaga(dispatchHelper, dirtyHandlingSaga(), cancelRequestedAction)
								.withState(createStoreForTesting(activities))
								.run()
								.then(result => {
									const { effects } = result;

									notDeepStrictEqual(effects.put, undefined, "Put effects were expected");
									strictEqual(effects.put.length, expectedActions.length);

									for (let i = 0; i < expectedActions.length; i++) {
										deepStrictEqual(effects.put[i], put(expectedActions[i]));
									}
								});
						});
					});

					describe("with A = dirty and B = dirty", () => {
						it("fires two setCancelConfirmationRequired actions and cancels A and B if noVeto is returned", async () => {
							const cancelRequestedAction = ActivityActions.cancelRequested({
								activityIds: ["A", "B"]
							});

							const activityMockA = createNewActivity({
								id: "A",
								activationTimestamp: 1000,
								dirtyStateOfActivityDataHolder: true
							});
							const activityMockB = createNewActivity({
								id: "B",
								activationTimestamp: 1000,
								dirtyStateOfActivityDataHolder: true
							});
							const activities = [activityMockA, activityMockB];
							const expectedActions: Action<{}>[] = [
								ActivityActions.setCancelConfirmationRequired({
									activityId: "A",
									cancelConfirmationRequired: true
								}),
								ActivityActions.cancel({ activityId: "A" }),
								ActivityActions.setCancelConfirmationRequired({
									activityId: "B",
									cancelConfirmationRequired: true
								}),
								ActivityActions.cancel({ activityId: "B" }),
								ActivityActions.responseCancelRequested({ cancelled: true })
							];

							return expectSaga(dispatchHelper, dirtyHandlingSaga(), cancelRequestedAction)
								.withState(createStoreForTesting(activities))
								.dispatch(
									ActivityActions.responseCancelConfirmation({
										activityId: "A",
										veto: false
									})
								)
								.dispatch(
									ActivityActions.responseCancelConfirmation({
										activityId: "B",
										veto: false
									})
								)
								.run()
								.then(result => {
									const { effects } = result;

									notDeepStrictEqual(effects.put, undefined, "Put effects were expected");
									strictEqual(effects.put.length, expectedActions.length);

									for (let i = 0; i < expectedActions.length; i++) {
										deepStrictEqual(effects.put[i], put(expectedActions[i]));
									}
								});
						});

						it("fires one setCancelConfirmationRequired for A and does then stop, when a veto for A is returned", async () => {
							const cancelRequestedAction = ActivityActions.cancelRequested({
								activityIds: ["A", "B"]
							});

							const activityMockA = createNewActivity({
								id: "A",
								activationTimestamp: 1000,
								dirtyStateOfActivityDataHolder: true,
								cancelConfirmationRequired: true
							});
							const activityMockB = createNewActivity({
								id: "B",
								activationTimestamp: 1000,
								dirtyStateOfActivityDataHolder: true
							});
							const activities = [activityMockA, activityMockB];

							const expectedActions: Action<{}>[] = [
								ActivityActions.setCancelConfirmationRequired({
									activityId: "A",
									cancelConfirmationRequired: true
								}),
								ActivityActions.responseCancelRequested({ cancelled: false })
							];

							return expectSaga(dispatchHelper, dirtyHandlingSaga(), cancelRequestedAction)
								.withState(createStoreForTesting(activities))
								.dispatch(
									ActivityActions.responseCancelConfirmation({
										activityId: "A",
										veto: true
									})
								)
								.run()
								.then(result => {
									const { effects } = result;

									notDeepStrictEqual(effects.put, undefined, "Put effects were expected");
									strictEqual(effects.put.length, expectedActions.length);

									for (let i = 0; i < expectedActions.length; i++) {
										deepStrictEqual(effects.put[i], put(expectedActions[i]));
									}
								});
						});

						it(
							"fires two setCancelConfirmationRequired actions " +
								" and cancels A and not B, when noVeto is returned for A and veto is returned for B",
							async () => {
								const cancelRequestedAction = ActivityActions.cancelRequested({
									activityIds: ["A", "B"]
								});

								const activityMockA = createNewActivity({
									id: "A",
									activationTimestamp: 1000,
									dirtyStateOfActivityDataHolder: true
								});
								const activityMockB = createNewActivity({
									id: "B",
									activationTimestamp: 1000,
									dirtyStateOfActivityDataHolder: true,
									cancelConfirmationRequired: true
								});

								const activities = [activityMockA, activityMockB];
								const expectedActions: Action<{}>[] = [
									ActivityActions.setCancelConfirmationRequired({
										activityId: "A",
										cancelConfirmationRequired: true
									}),
									ActivityActions.cancel({ activityId: "A" }),
									ActivityActions.setCancelConfirmationRequired({
										activityId: "B",
										cancelConfirmationRequired: true
									}),
									ActivityActions.responseCancelRequested({ cancelled: false })
								];

								return expectSaga(dispatchHelper, dirtyHandlingSaga(), cancelRequestedAction)
									.withState(createStoreForTesting(activities))
									.dispatch(
										ActivityActions.responseCancelConfirmation({
											activityId: "A",
											veto: false
										})
									)
									.dispatch(
										ActivityActions.responseCancelConfirmation({
											activityId: "B",
											veto: true
										})
									)
									.run()
									.then(result => {
										const { effects } = result;

										notDeepStrictEqual(effects.put, undefined, "Put effects were expected");
										strictEqual(effects.put.length, expectedActions.length);

										for (let i = 0; i < expectedActions.length; i++) {
											deepStrictEqual(effects.put[i], put(expectedActions[i]));
										}
									});
							}
						);
					});
				});
			});

			describe("which are related, with A being the parent of B", () => {
				describe("and using A as a payload for cancelRequested", () => {
					describe("with A != dirty and B != dirty", () => {
						it("cancels A", async () => {
							const cancelRequestedAction = ActivityActions.cancelRequested({
								activityIds: ["A"]
							});

							const activityMockA = createNewActivity({
								id: "A",
								activationTimestamp: 1000
							});
							const activityMockB = createNewActivity({
								id: "B",
								initiatingActivityId: "A",
								activationTimestamp: 1500
							});
							const activities = [activityMockA, activityMockB];
							const expectedActions: Action<{}>[] = [
								ActivityActions.cancel({ activityId: "A" }),
								ActivityActions.responseCancelRequested({ cancelled: true })
							];

							return expectSaga(dispatchHelper, dirtyHandlingSaga(), cancelRequestedAction)
								.withState(createStoreForTesting(activities))
								.run()
								.then(result => {
									const { effects } = result;

									notDeepStrictEqual(effects.put, undefined, "Put effects were expected");
									strictEqual(effects.put.length, expectedActions.length);

									for (let i = 0; i < expectedActions.length; i++) {
										deepStrictEqual(effects.put[i], put(expectedActions[i]));
									}
								});
						});
					});

					describe("with A != dirty and B = dirty", () => {
						it("fires a setVeto action and cancels A if noVeto is returned", async () => {
							const cancelRequestedAction = ActivityActions.cancelRequested({
								activityIds: ["A"]
							});

							const activityMockA = createNewActivity({
								id: "A",
								activationTimestamp: 1000
							});
							const activityMockB = createNewActivity({
								id: "B",
								initiatingActivityId: "A",
								activationTimestamp: 1500,
								dirtyStateOfActivityDataHolder: true
							});
							const activities = [activityMockA, activityMockB];
							const expectedActions: Action<{}>[] = [
								ActivityActions.setCancelConfirmationRequired({
									activityId: "A",
									cancelConfirmationRequired: true
								}),
								ActivityActions.cancel({ activityId: "A" }),
								ActivityActions.responseCancelRequested({ cancelled: true })
							];

							return expectSaga(dispatchHelper, dirtyHandlingSaga(), cancelRequestedAction)
								.withState(createStoreForTesting(activities))
								.dispatch(
									ActivityActions.responseCancelConfirmation({
										activityId: "A",
										veto: false
									})
								)
								.run()
								.then(result => {
									const { effects } = result;

									notDeepStrictEqual(effects.put, undefined, "Put effects were expected");
									strictEqual(effects.put.length, expectedActions.length);

									for (let i = 0; i < expectedActions.length; i++) {
										deepStrictEqual(effects.put[i], put(expectedActions[i]));
									}
								});
						});

						it("fires a setVeto action and does not cancel A and B if a veto is returned", async () => {
							const cancelRequestedAction = ActivityActions.cancelRequested({
								activityIds: ["A"]
							});

							const activityMockA = createNewActivity({
								id: "A",
								activationTimestamp: 1000,
								dirtyStateOfActivityDataHolder: false,
								cancelConfirmationRequired: true
							});
							const activityMockB = createNewActivity({
								id: "B",
								initiatingActivityId: "A",
								activationTimestamp: 1500,
								dirtyStateOfActivityDataHolder: true
							});
							const activities = [activityMockA, activityMockB];
							const expectedActions: Action<{}>[] = [
								ActivityActions.setCancelConfirmationRequired({
									activityId: "A",
									cancelConfirmationRequired: true
								}),
								ActivityActions.responseCancelRequested({ cancelled: false })
							];

							return expectSaga(dispatchHelper, dirtyHandlingSaga(), cancelRequestedAction)
								.withState(createStoreForTesting(activities))
								.dispatch(
									ActivityActions.responseCancelConfirmation({
										activityId: "A",
										veto: true
									})
								)
								.run()
								.then(result => {
									const { effects } = result;

									notDeepStrictEqual(effects.put, undefined, "Put effects were expected");
									strictEqual(effects.put.length, expectedActions.length);

									for (let i = 0; i < expectedActions.length; i++) {
										deepStrictEqual(effects.put[i], put(expectedActions[i]));
									}
								});
						});
					});
				});

				describe("and using A and B as payload for cancelRequest", () => {
					describe("and B gets cancelled when A gets cancelled", () => {
						it("does not try to cancel B again", () => {
							const cancelRequestedAction = ActivityActions.cancelRequested({
								activityIds: ["A", "B"]
							});

							const activityMockA = createNewActivity({
								id: "A",
								activationTimestamp: 1000
							});
							const activityMockB = createNewActivity({
								id: "B",
								initiatingActivityId: "A",
								activationTimestamp: 1500
							});
							const activities = [activityMockA, activityMockB];
							const expectedActions: Action<{}>[] = [
								ActivityActions.cancel({ activityId: "A" }),
								ActivityActions.responseCancelRequested({ cancelled: true })
							];

							return expectSaga(dispatchHelper, dirtyHandlingSaga(), cancelRequestedAction)
								.withReducer(testReducer, createStoreForTesting(activities))
								.run()
								.then(result => {
									const { effects } = result;
									notDeepStrictEqual(effects.put, undefined, "Put effects were expected");
									strictEqual(effects.put.length, expectedActions.length);

									for (let i = 0; i < expectedActions.length; i++) {
										deepStrictEqual(effects.put[i], put(expectedActions[i]));
									}
								});
						});
					});
				});
			});
		});

		describe("Given a map of activities", () => {
			it("cancels them in the right order", () => {
				const cancelRequestedAction = ActivityActions.cancelRequested({
					activityIds: ["A", "A1", "B", "C"]
				});

				// setup
				const activityMockA = createNewActivity({
					id: "A",
					activationTimestamp: 1000
				});
				const activityMockA1 = createNewActivity({
					id: "A1",
					initiatingActivityId: "A",
					activationTimestamp: 500
				});
				const activityMockB = createNewActivity({
					id: "B",
					activationTimestamp: 300
				});
				const activityMockC = createNewActivity({
					id: "C",
					activationTimestamp: 200
				});
				const activities = [activityMockA, activityMockA1, activityMockB, activityMockC];

				const expectedActions: Action<{}>[] = [
					ActivityActions.cancel({ activityId: "C" }),
					ActivityActions.cancel({ activityId: "B" }),
					ActivityActions.cancel({ activityId: "A" }),
					ActivityActions.cancel({ activityId: "A1" }),
					ActivityActions.responseCancelRequested({ cancelled: true })
				];

				return expectSaga(dispatchHelper, dirtyHandlingSaga(), cancelRequestedAction)
					.withState(createStoreForTesting(activities))
					.run()
					.then(result => {
						const { effects } = result;

						notDeepStrictEqual(effects.put, undefined, "Put effects were expected");
						strictEqual(effects.put.length, expectedActions.length);

						for (let i = 0; i < expectedActions.length; i++) {
							deepStrictEqual(effects.put[i], put(expectedActions[i]));
						}
					});
			});
		});
	});
});

function createNewActivity(props: {
	id: string;
	initiatingActivityId?: string;
	activationTimestamp?: number;
	dirtyStateOfActivityDataHolder?: boolean;
	cancelConfirmationRequired?: boolean;
	dataHolders?: Activity.DataHolder[];
}): Activity {
	const {
		id,
		initiatingActivityId,
		activationTimestamp,
		dirtyStateOfActivityDataHolder,
		cancelConfirmationRequired,
		dataHolders
	} = props;

	const defaultActivityDataHolder = {
		descriptor: { model: "dirty-tests" },
		data: {},
		dirty: dirtyStateOfActivityDataHolder ? dirtyStateOfActivityDataHolder : false,
		loadingState: "missing",
		savingState: "not_saved",
		slices: {}
	} satisfies Activity.DataHolder;

	return createActivity({
		descriptor: defaultActivityDataHolder.descriptor,
		id,
		initiatingActivityId,
		activationTimestamp: activationTimestamp ?? 0,
		cancelConfirmationRequired,
		dataHolders: [defaultActivityDataHolder, ...(dataHolders ?? [])]
	});
}

function createStoreForTesting(activities: Activity[]): {} {
	const state: any = createGeneralStore().store.getState();
	for (const entry of activities) {
		state.activities[entry.id] = entry;
	}
	return state;
}

/*
 * Reducer to delete all activities from the store, if there was
 * a cancel or cancelRequested action
 */
function testReducer(state: any, action: AnyAction) {
	if (
		action.type === ActivityActions.cancel.type ||
		action.type === ActivityActions.cancelRequested.type
	) {
		return {
			...state,
			activities: {}
		};
	}

	return state;
}
