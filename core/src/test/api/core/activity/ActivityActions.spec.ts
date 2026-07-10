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

import { deepStrictEqual, strictEqual } from "node:assert/strict";

import type { Action, Failure, Success } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";

import type { Activity } from "../../../../core/activity/index.js";
import { ActivityActions } from "../../../../core/activity/index.js";

import { setupMockTimer } from "./timers.js";

describe("core.activity.actions", () => {
	describe("ActivityActions", () => {
		describe("cancel is an ActionCreator, which", () => {
			describe("given the id of an activity to be canceled", () => {
				it("creates a cancel action for this activity.", () => {
					const payload: ActivityActions.ActivityActionPayload = {
						activityId: "1"
					};
					const expectedAction: Action<ActivityActions.ActivityActionPayload> = {
						type: ActivityActions.cancel.type,
						payload
					};

					deepStrictEqual(ActivityActions.cancel(payload), expectedAction);
				});
			});
		});

		describe("clearError is an ActionCreator, which", () => {
			describe("given the id of an activity, for which an error should be cleared,", () => {
				it("creates a clearError action for this activity.", () => {
					const payload: ActivityActions.ActivityActionPayload = {
						activityId: "1"
					};
					const expectedAction: Action<ActivityActions.ActivityActionPayload> = {
						type: ActivityActions.clearError.type,
						payload
					};

					deepStrictEqual(ActivityActions.clearError(payload), expectedAction);
				});
			});
		});

		describe("commit is an AsyncActionCreators object, which", () => {
			describe("given the id of an activity to be committed", () => {
				describe("provides the three sub ActionCreators started, done and failed, of which", () => {
					it("started creates a commit.started action for this activity.", () => {
						const payload: ActivityActions.CommitPayload = {
							activityId: "1",
							dataHolderDescriptors: [{ d1: "descriptor1" }, { d2: "descriptor2" }]
						};
						const expectedAction: Action<ActivityActions.CommitPayload> = {
							type: ActivityActions.commit.started.type,
							payload
						};

						deepStrictEqual(ActivityActions.commit.started(payload), expectedAction);
					});

					it("done creates a commit.done action for this activity.", () => {
						const payload: Success<ActivityActions.ActivityActionPayload, {}> = {
							params: { activityId: "1" },
							result: {}
						};
						const expectedAction: Action<Success<ActivityActions.ActivityActionPayload, {}>> = {
							type: ActivityActions.commit.done.type,
							payload
						};

						deepStrictEqual(ActivityActions.commit.done(payload), expectedAction);
					});

					it("failed creates a commit.failed action for this activity.", () => {
						const error = new Error("commit failed");

						const payload: Failure<ActivityActions.ActivityActionPayload, any> = {
							params: { activityId: "1" },
							error: error
						};

						const expectedAction: Action<Failure<ActivityActions.ActivityActionPayload, any>> = {
							error: true,
							type: ActivityActions.commit.failed.type,
							payload
						};

						deepStrictEqual(ActivityActions.commit.failed(payload), expectedAction);
					});
				});
			});
		});

		describe("save is an AsyncActionCreators object, which", () => {
			describe("given the id of an activity to be saved", () => {
				describe("provides the three sub ActionCreators started, done and failed, of which", () => {
					it("started creates a save.started action for this activity.", () => {
						const payload: ActivityActions.SaveDataPayload = {
							activityId: "1",
							dataHolderDescriptors: [{ d1: "descriptor1" }, { d2: "descriptor2" }]
						};
						const expectedAction: Action<ActivityActions.SaveDataPayload> = {
							type: ActivityActions.save.started.type,
							payload
						};

						deepStrictEqual(ActivityActions.save.started(payload), expectedAction);
					});

					it("done creates a save.done action for this activity.", () => {
						const payload: Success<ActivityActions.SaveDataPayload, {}> = {
							params: {
								activityId: "1",
								dataHolderDescriptors: [{ d1: "descriptor1" }, { d2: "descriptor2" }]
							},
							result: {}
						};
						const expectedAction: Action<Success<ActivityActions.ActivityActionPayload, {}>> = {
							type: ActivityActions.save.done.type,
							payload
						};

						deepStrictEqual(ActivityActions.save.done(payload), expectedAction);
					});

					it("failed creates a save.failed action for this activity.", () => {
						const error = new Error("save failed");

						const payload: Failure<ActivityActions.ActivityActionPayload, any> = {
							params: { activityId: "1" },
							error: error
						};

						const expectedAction: Action<Failure<ActivityActions.ActivityActionPayload, any>> = {
							error: true,
							type: ActivityActions.save.failed.type,
							payload
						};

						deepStrictEqual(ActivityActions.save.failed(payload), expectedAction);
					});
				});
			});
		});

		describe("error is an ActionCreator, which ", () => {
			describe("given the id of an activity, which should get an error,", () => {
				describe("and given the operation type of this activity", () => {
					describe("and given the error, the activity should receive,", () => {
						it("creates an error action for this activity.", () => {
							const error = new Error("activity error");
							const payload: ActivityActions.ErrorPayload = {
								activityId: "1",
								operationType: "loading",
								error
							};
							const expectedAction: Action<ActivityActions.ErrorPayload> = {
								type: ActivityActions.error.type,
								payload
							};

							deepStrictEqual(ActivityActions.error(payload), expectedAction);
						});
					});
				});
			});
		});

		describe("loadData is an ActionCreator, which", () => {
			describe("given the id of an activity, for which data should be loaded,", () => {
				describe("and given the descriptor of an activity ", () => {
					it("creates a loadData action for this activity.", () => {
						const payload: ActivityActions.LoadDataPayload = {
							activityId: "1"
						};
						const expectedAction: Action<ActivityActions.LoadDataPayload> = {
							type: ActivityActions.loadData.type,
							payload
						};

						deepStrictEqual(ActivityActions.loadData(payload), expectedAction);
					});
				});
			});
		});

		describe("lock is an ActionCreator, which ", () => {
			describe("given the id of an activity, which should be locked,", () => {
				describe("and given the owner of this activity's lock", () => {
					describe("and given the lock details", () => {
						it("creates a lock action for this activity.", () => {
							const payload: ActivityActions.LockPayload = {
								id: "a random lock id",
								activityId: "1",
								owner: "me",
								details: {
									any: "thing"
								}
							};
							const expectedAction: Action<ActivityActions.LockPayload> = {
								type: ActivityActions.lock.type,
								payload
							};

							deepStrictEqual(ActivityActions.lock(payload), expectedAction);
						});
					});
				});
			});
		});

		describe("push is an ActionCreator, which", () => {
			describe("given an activity, which should be added to the application's activities,", () => {
				const testActivityDescriptor: Activity.Descriptor = {
					model: "Hallo"
				};
				const testActivity: Activity = {
					id: "1",
					activationTimestamp: 1234,
					descriptor: testActivityDescriptor,
					dataHolders: []
				};

				describe("and nothing else", () => {
					it("creates a push action for this activity.", () => {
						const payload: ActivityActions.PushPayload = {
							activity: testActivity
						};
						const expectedAction: Action<ActivityActions.PushPayload> = {
							type: ActivityActions.push.type,
							payload
						};

						deepStrictEqual(ActivityActions.push(payload), expectedAction);
					});
				});
			});
		});

		describe("create is a factory for an ActivityCreator, which", () => {
			describe("given in its parameter object only the descriptor of an activity to be created", () => {
				beforeEach(() => (ActivityActions.activityIdCounter = 0));

				it("returns a push action to invoke the creation of the activity with default values", () => {
					const { now, withTimeFreeze } = setupMockTimer();

					const payload: ActivityActions.CreatePayload = {
						activityDescriptor: { model: "test" }
					};

					const createdAction = withTimeFreeze(ActivityActions.create)(payload);

					strictEqual(createdAction.type, ActivityActions.push.type);

					const activity = createdAction.payload.activity;
					deepStrictEqual(activity, {
						id: "1",
						descriptor: { model: "test" },
						initiatingActivityId: undefined,
						activationTimestamp: now(),
						dataHolders: [
							{
								data: {},
								descriptor: { model: "test" },
								dirty: false,
								loadingState: "missing",
								savingState: "not_saved",
								slices: {}
							}
						]
					});
				});

				it("returns push actions where activities have increasing numeric ids if none were given", () => {
					const { withTimeFreeze } = setupMockTimer();

					ActivityActions.activityIdCounter = 16;

					const payload: ActivityActions.CreatePayload = {
						activityDescriptor: { model: "test" }
					};

					const createdAction1 = withTimeFreeze(ActivityActions.create)(payload);
					const createdAction2 = withTimeFreeze(ActivityActions.create)(payload);
					const createdAction3 = withTimeFreeze(ActivityActions.create)(payload);

					strictEqual(createdAction1.payload.activity.id, "17");
					strictEqual(createdAction2.payload.activity.id, "18");
					strictEqual(createdAction3.payload.activity.id, "19");

					strictEqual(ActivityActions.activityIdCounter, 19);
				});

				it("returns push actions where activities have increasing numeric ids if some were given non numeric ids", () => {
					const { withTimeFreeze } = setupMockTimer();

					ActivityActions.activityIdCounter = 11;

					const payload: ActivityActions.CreatePayload = {
						activityDescriptor: { model: "test" }
					};

					const createdAction1 = withTimeFreeze(ActivityActions.create)({
						...payload,
						activityId: "non numeric1"
					});
					const createdAction2 = withTimeFreeze(ActivityActions.create)(payload);
					const createdAction3 = withTimeFreeze(ActivityActions.create)({
						...payload,
						activityId: "non numeric2"
					});
					const createdAction4 = withTimeFreeze(ActivityActions.create)(payload);

					strictEqual(createdAction1.payload.activity.id, "non numeric1");
					strictEqual(createdAction2.payload.activity.id, "12");
					strictEqual(createdAction3.payload.activity.id, "non numeric2");
					strictEqual(createdAction4.payload.activity.id, "13");

					strictEqual(ActivityActions.activityIdCounter, 13);
				});

				describe("and given additionally some of the optional payload property values", () => {
					it(
						"returns a push action for creating an activity with some of those values pre filled and " +
							"saving state reset to 'not_saved' and loading state depending on given data",
						() => {
							const { now, withTimeFreeze } = setupMockTimer();

							const payload: ActivityActions.CreatePayload = {
								activityId: "2",
								activityDescriptor: { model: "test" },
								initiatingActivityId: "1",
								data: {}
							};

							const createdAction = withTimeFreeze(ActivityActions.create)(payload);

							// renaming and repositioning payload properties for the comparison
							const { activityDescriptor: descriptor, activityId: id, data, ...rest } = payload;
							strictEqual(createdAction.type, ActivityActions.push.type);
							deepStrictEqual(createdAction.payload, {
								activity: {
									...rest,
									id,
									descriptor,
									activationTimestamp: now(),
									dataHolders: [
										{
											data: {},
											descriptor: {
												model: "test"
											},
											dirty: false,
											loadingState: "loaded",
											savingState: "not_saved",
											slices: {}
										}
									]
								}
							});
						}
					);
				});

				describe("and given additionally a data property containing initial activity data", () => {
					it(
						"returns a push action for creating an activity, which has already the given data " +
							"and the loadingState 'loaded'",
						() => {
							const { now, withTimeFreeze } = setupMockTimer();

							const data: {
								readonly document: Activity.Data.Document;
							} = {
								document: {
									id: "someId",
									modelId: "test",
									root: {}
								}
							};

							const payload: ActivityActions.CreatePayload = {
								activityId: "2",
								activityDescriptor: { model: "test" },
								initiatingActivityId: "1",
								data
							};

							const createdAction = withTimeFreeze(ActivityActions.create)(payload);

							// renaming and repositioning payload properties for the comparison
							const {
								activityDescriptor: descriptor,
								activityId: id,
								data: _data,
								...rest
							} = payload;
							strictEqual(createdAction.type, ActivityActions.push.type);
							deepStrictEqual(createdAction.payload, {
								activity: {
									...rest,
									id,
									descriptor,
									activationTimestamp: now(),
									dataHolders: [
										{
											data: _data,
											descriptor: {
												model: "test"
											},
											dirty: false,
											loadingState: "loaded",
											savingState: "not_saved",
											slices: {}
										}
									]
								}
							});
						}
					);
				});

				describe("and given among some optional payload property values the loadingState 'without'", () => {
					it("creates a create action for creating an activity with those values pre filled", () => {
						const { now, withTimeFreeze } = setupMockTimer();

						const payload: ActivityActions.CreatePayload = {
							activityId: "2",
							activityDescriptor: { model: "test" },
							initiatingActivityId: "1",
							loadingState: "without"
						};

						const createdAction = withTimeFreeze(ActivityActions.create)(payload);

						// renaming and repositioning payload properties for the comparison
						const {
							activityDescriptor: descriptor,
							activityId: id,
							loadingState,
							data,
							...rest
						} = payload;

						strictEqual(createdAction.type, ActivityActions.push.type);
						deepStrictEqual(createdAction.payload, {
							activity: {
								...rest,
								id,
								descriptor,
								activationTimestamp: now(),
								dataHolders: [
									{
										data: {},
										descriptor,
										dirty: false,
										loadingState: "without",
										savingState: "not_saved",
										slices: {}
									}
								]
							}
						});
					});
				});
			});
		});

		describe("reload is an ActionCreator, which", () => {
			describe("given the id of an activity, which should be reloaded,", () => {
				it("creates a reload action for this activity.", () => {
					const payload: ActivityActions.ActivityActionPayload = {
						activityId: "1"
					};
					const expectedAction: Action<ActivityActions.ActivityActionPayload> = {
						type: ActivityActions.reloadData.type,
						payload
					};

					deepStrictEqual(ActivityActions.reloadData(payload), expectedAction);
				});
			});
		});

		describe("setData is an ActionCreator, which", () => {
			describe("given the id of an activity, whose data should be set,", () => {
				describe("and given the data", () => {
					it("creates a setData action for this activity.", () => {
						const payload: ActivityActions.SetDataPayload = {
							activityId: "1",
							data: { hello: "Test" }
						};
						const expectedAction: Action<ActivityActions.SetDataPayload> = {
							type: ActivityActions.setData.type,
							payload
						};

						deepStrictEqual(ActivityActions.setData(payload), expectedAction);
					});

					describe("and optionally given the id of the source activity of the data", () => {
						it("creates a setData action with this id present in the payload", () => {
							const payload: ActivityActions.SetDataPayload = {
								activityId: "1",
								data: { hello: "Test" },
								datasourceActivityId: "2"
							};
							const expectedAction: Action<ActivityActions.SetDataPayload> = {
								type: ActivityActions.setData.type,
								payload
							};

							deepStrictEqual(ActivityActions.setData(payload), expectedAction);
						});
					});

					describe("and optionally given a dirty boolean flag", () => {
						it("creates a setData action with this dirty flag present in the payload", () => {
							// true case
							const payload: ActivityActions.SetDataPayload = {
								activityId: "1",
								data: { hello: "Test" },
								dirty: true
							};
							const expectedAction: Action<ActivityActions.SetDataPayload> = {
								type: ActivityActions.setData.type,
								payload
							};

							deepStrictEqual(ActivityActions.setData(payload), expectedAction);

							// false case
							const payload2: ActivityActions.SetDataPayload = {
								activityId: "1",
								data: { hello: "Test" },
								dirty: false
							};
							const expectedAction2: Action<ActivityActions.SetDataPayload> = {
								type: ActivityActions.setData.type,
								payload: payload2
							};

							deepStrictEqual(ActivityActions.setData(payload2), expectedAction2);
						});
					});
				});
			});
		});

		describe("setDataByDescriptor is an ActionCreator, which", () => {
			describe("given an activity id and a descriptor of a data holder, whose data should be set,", () => {
				describe("and given the data", () => {
					it("creates a setDataByDescriptor action for this activity.", () => {
						const payload: ActivityActions.SetDataByDescriptorPayload = {
							activityId: "1",
							descriptor: { instance: "1" },
							data: { hello: "Test" }
						};
						const expectedAction: Action<ActivityActions.SetDataByDescriptorPayload> = {
							type: ActivityActions.setDataByDescriptor.type,
							payload
						};

						deepStrictEqual(ActivityActions.setDataByDescriptor(payload), expectedAction);
					});
				});
			});
		});

		describe("setView is an ActionCreator, which", () => {
			describe("given the id of an activity, for which the view should be set,", () => {
				describe("and given the view to set", () => {
					it("creates a setView action for this activity.", () => {
						const payload: ActivityActions.SetCasePayload = {
							activityId: "1",
							case: "testView"
						};
						const expectedAction: Action<ActivityActions.SetCasePayload> = {
							type: ActivityActions.setCase.type,
							payload
						};

						deepStrictEqual(ActivityActions.setCase(payload), expectedAction);
					});
				});

				describe("and given undefined as view to set", () => {
					it("creates a setView action with undefined view.", () => {
						const payload: ActivityActions.SetCasePayload = {
							activityId: "1",
							case: undefined
						};
						const expectedAction: Action<ActivityActions.SetCasePayload> = {
							type: ActivityActions.setCase.type,
							payload
						};

						deepStrictEqual(ActivityActions.setCase(payload), expectedAction);
					});
				});
			});
		});

		describe("unlock is an ActionCreator, which", () => {
			describe("given the id of an activity to unlock", () => {
				it("creates a unlock action for this activity.", () => {
					const payload: ActivityActions.UnlockPayload = {
						activityId: "1",
						lockId: "a random lock id"
					};
					const expectedAction: Action<ActivityActions.UnlockPayload> = {
						type: ActivityActions.unlock.type,
						payload
					};

					deepStrictEqual(ActivityActions.unlock(payload), expectedAction);
				});
			});
		});

		describe("setDirty is an ActionCreator, which", () => {
			describe("given the id of an activity, for which the dirty state should change,", () => {
				it("creates a setDirty action for this activity.", () => {
					const payload: ActivityActions.SetDirtyPayload = {
						activityId: "1",
						dirty: true
					};
					const expectedAction: Action<ActivityActions.SetDirtyPayload> = {
						type: ActivityActions.setDirty.type,
						payload
					};

					deepStrictEqual(ActivityActions.setDirty(payload), expectedAction);
				});
			});
		});

		const DataReducerAction = {
			withId: {
				type: "anything",
				payload: { activityId: "1", other: "anything" }
			},
			withParamsId: {
				type: "anything",
				payload: { params: { activityId: "1", other: "anything" } }
			},
			withoutId: { type: "anything", payload: { unused: "anything" } },
			withoutPayload: { type: "anything", other: {} },
			withPayloadNull: { type: "anything", payload: null },
			withPayloadNotAnObject: { type: "anything", payload: 1 }
		};
		describe("DataReducerAction.isInstance is a type assert function, which", () => {
			it("returns true if the given action contains a payload.activityId property", () => {
				strictEqual(ActivityActions.DataReducerAction.isInstance(DataReducerAction.withId), true);
			});

			it("returns true if the given action contains a payload.params.activityId property", () => {
				strictEqual(
					ActivityActions.DataReducerAction.isInstance(DataReducerAction.withParamsId),
					true
				);
			});

			it("returns false in all other cases", () => {
				strictEqual(
					ActivityActions.DataReducerAction.isInstance(DataReducerAction.withoutId),
					false
				);
				strictEqual(
					ActivityActions.DataReducerAction.isInstance(DataReducerAction.withoutPayload),
					false
				);
				strictEqual(
					ActivityActions.DataReducerAction.isInstance(DataReducerAction.withPayloadNull),
					false
				);
				strictEqual(
					ActivityActions.DataReducerAction.isInstance(DataReducerAction.withPayloadNotAnObject),
					false
				);
			});
		});

		describe("DataReducerAction.getActivityId is a utility function, which", () => {
			it("returns the value of the payload.activityId property if the given DataReducerAction contains it", () => {
				strictEqual(ActivityActions.DataReducerAction.getActivityId(DataReducerAction.withId), "1");
			});
			it("returns the value of the payload.params.activityId property if the given DataReducerAction contains it", () => {
				strictEqual(
					ActivityActions.DataReducerAction.getActivityId(DataReducerAction.withParamsId),
					"1"
				);
			});
		});
	});
});
