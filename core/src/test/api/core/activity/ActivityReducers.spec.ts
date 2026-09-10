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

import { deepStrictEqual } from "node:assert/strict";

import type { Action } from "typescript-fsa";

import type { Activity, ActivityMap } from "../../../../core/activity/index.js";
import { ActivityActions, ActivityReducers } from "../../../../core/activity/index.js";
import { handleSetDirty } from "../../../../core/activity/internal/reducers/handler/setDirty.js";
import { createActivity, createDataHolder } from "../../../utils/activity.js";

import { executeTestForSetThumbnails } from "../a12-internal/thumbnails/action.js";

import { executeTestForCancel } from "./actions/cancel.js";
import { executeTestForClearError } from "./actions/clearError.js";
import { executeTestForCommitDone } from "./actions/commit.done.js";
import { executeTestForCommitStarted } from "./actions/commit.started.js";
import { executeTestForError } from "./actions/error.js";
import { executeTestForLoadData } from "./actions/loadData.js";
import { executeTestForLock } from "./actions/lock.js";
import { executeTestForPushAction } from "./actions/pushAction.js";
import { executeTestForResponseCancelConfirmation } from "./actions/responseCancelConfirmation.js";
import { executeTestForSaveDone } from "./actions/save.done.js";
import { executeTestForSaveStarted } from "./actions/save.started.js";
import { executeTestForSetCancelConfirmationRequired } from "./actions/setCancelConfirmationRequired.js";
import { executeTestForSetData } from "./actions/setData.js";
import { executeTestForSetDataByDescriptor } from "./actions/setDataByDescriptor.js";
import { executeTestForSetDirty } from "./actions/setDirty.js";
import { executeTestForSetView } from "./actions/setView.js";
import { executeTestForUnlock } from "./actions/unlock.js";
import { setupMockTimer } from "./timers.js";
import { setupActivityMap } from "./util.js";

describe("core.activity.reducer", () => {
	const mockTimerSetup = setupMockTimer();

	describe("ActivityReducers", () => {
		describe("activities", () => {
			describe("given an ActivityMap", () => {
				describe("and given a push action", () => {
					executeTestForPushAction(mockTimerSetup);
				});

				describe("and given a loadData action", () => {
					executeTestForLoadData();
				});

				describe("and given a setData action", () => {
					executeTestForSetData(mockTimerSetup);
				});

				describe("and given a setDataByDescriptor action", () => {
					executeTestForSetDataByDescriptor(mockTimerSetup);
				});

				describe("and given a setView action", () => {
					executeTestForSetView();
				});

				describe("and given a cancel action", () => {
					executeTestForCancel(mockTimerSetup);
				});

				describe("and given a lock action", () => {
					executeTestForLock();
				});

				describe("and given an unlock action", () => {
					executeTestForUnlock();
				});

				describe("and given an error action", () => {
					executeTestForError();
				});

				describe("and given a clearError action", () => {
					executeTestForClearError();
				});

				describe("and given a commit.started action", () => {
					executeTestForCommitStarted();
				});

				describe("and given a commit.done action", () => {
					executeTestForCommitDone(mockTimerSetup);
				});

				describe("and given a save.started action", () => {
					executeTestForSaveStarted();
				});

				describe("and given a save.done action", () => {
					executeTestForSaveDone();
				});

				describe("and given a setDirty action", () => {
					executeTestForSetDirty();
				});

				describe("and given a responseCancelConfirmation action", () => {
					executeTestForResponseCancelConfirmation();
				});

				describe("and given a setCancelConfirmationRequired action", () => {
					executeTestForSetCancelConfirmationRequired();
				});

				describe("and given a setThumbnails action", () => {
					executeTestForSetThumbnails();
				});

				describe("and given any other action", () => {
					it("returns the unmodified ActivityMap", () => {
						const stateLocal = setupActivityMap([
							createActivity({
								id: "a",
								descriptor: { model: "test" }
							})
						]);

						const emptyAction: Action<{}> = {
							type: "EmptyAction",
							payload: {}
						};

						deepStrictEqual(ActivityReducers.activities(stateLocal, emptyAction), stateLocal);
					});
				});
			});
		});

		describe("createActivityReducers", () => {
			const mockAction = createDRAction();

			const activity = createActivity({
				id: "1",
				descriptor: { id: "1" },
				dataHolders: [
					createDataHolder({ descriptor: { id: "1" } }),
					createDataHolder({ descriptor: { id: "2" } }),
					createDataHolder({ descriptor: { id: "3" } })
				]
			});

			const activityMap = setupActivityMap([
				activity,
				createActivity({
					id: "2",
					descriptor: { id: "2" },
					dataHolders: [createDataHolder({ descriptor: { other: "2" } })]
				}),
				createActivity({
					id: "3",
					descriptor: { id: "3" },
					dataHolders: [createDataHolder({ descriptor: { other: "3" } })]
				})
			]);

			interface SetupProps {
				readonly dataReducers: ActivityReducers.DataReducer[];
				readonly expectedDataHolders: Activity.DataHolder[];
			}

			function testActivityReducers({ dataReducers, expectedDataHolders }: SetupProps): void {
				const activityReducers = ActivityReducers.createActivityReducers({
					dataReducers
				});

				const newActivityMap = activityReducers(activityMap, mockAction);

				const expectedActivityMap: ActivityMap = {
					...activityMap,
					[activity.id]: {
						...activity,
						dataHolders: expectedDataHolders
					}
				};

				deepStrictEqual(newActivityMap, expectedActivityMap);
			}

			describe("create dh(s)", () => {
				describe("where one data reducer creates data holders", () => {
					it("creates all data holders and returns the final updated state", () => {
						const newDhs = [createDataHolder(), createDataHolder(), createDataHolder()];
						const dataReducers: ActivityReducers.DataReducer[] = [
							{
								reduce(dataHolders, action) {
									return action === mockAction ? [...dataHolders, ...newDhs] : dataHolders;
								}
							}
						];

						const expectedDataHolders = [...activity.dataHolders, ...newDhs];

						testActivityReducers({ dataReducers, expectedDataHolders });
					});
				});

				describe("where multiple data reducers create data holders", () => {
					it("creates the data holders per data reducer in order and returns the final updated state", () => {
						const newDh1 = createDataHolder();
						const newDh2 = createDataHolder();

						const dataReducers: ActivityReducers.DataReducer[] = [
							{
								reduce(dataHolders, action) {
									return action === mockAction ? [newDh1, ...dataHolders] : dataHolders;
								}
							},
							{
								reduce(dataHolders, action) {
									return action === mockAction ? [newDh2, ...dataHolders] : dataHolders;
								}
							}
						];

						const expectedDataHolders = [newDh2, newDh1, ...activity.dataHolders];

						testActivityReducers({ dataReducers, expectedDataHolders });
					});
				});
			});

			describe("update dh(s)", () => {
				describe("where one data reducer updates one data holder", () => {
					it("updates the data holder and returns the final updated state", () => {
						const dataReducers: ActivityReducers.DataReducer[] = [
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? dataHolders.map(updateOne("key", "r1"))
										: dataHolders;
								}
							}
						];

						const expectedDataHolders = [
							createDataHolder({
								descriptor: { id: "1" },
								data: { key: ["r1"] }
							}),
							createDataHolder({ descriptor: { id: "2" } }),
							createDataHolder({ descriptor: { id: "3" } })
						];

						testActivityReducers({ dataReducers, expectedDataHolders });
					});
				});

				describe("where one data reducer updates multiple data holders", () => {
					it("updates all data holders and returns the final updated state", () => {
						const dataReducers: ActivityReducers.DataReducer[] = [
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? dataHolders.map(updateMany("key", "r1"))
										: dataHolders;
								}
							}
						];

						const expectedDataHolders = [
							createDataHolder({
								descriptor: { id: "1" },
								data: { key: ["r1"] }
							}),
							createDataHolder({ descriptor: { id: "2" }, data: { key: ["r1"] } }),
							createDataHolder({ descriptor: { id: "3" }, data: { key: ["r1"] } })
						];

						testActivityReducers({ dataReducers, expectedDataHolders });
					});
				});

				describe("where multiple data reducers update one data holder", () => {
					it("executes the updates for all data reducers for the data holder in order and returns the final updated state", () => {
						const dataReducers: ActivityReducers.DataReducer[] = [
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? dataHolders.map(updateOne("key", "r1"))
										: dataHolders;
								}
							},
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? dataHolders.map(updateOne("key", "r2"))
										: dataHolders;
								}
							},
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? dataHolders.map(updateOne("key", "r3"))
										: dataHolders;
								}
							}
						];

						const expectedDataHolders = [
							createDataHolder({
								descriptor: { id: "1" },
								data: { key: ["r1", "r2", "r3"] }
							}),
							createDataHolder({ descriptor: { id: "2" } }),
							createDataHolder({ descriptor: { id: "3" } })
						];

						testActivityReducers({ dataReducers, expectedDataHolders });
					});
				});

				describe("where multiple data reducers update multiple data holders", () => {
					it("executes the updates for all data reducers for all the data holders in order and returns the final updated state", () => {
						const dataReducers: ActivityReducers.DataReducer[] = [
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? dataHolders.map(updateMany("key", "r1"))
										: dataHolders;
								}
							},
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? dataHolders.map(updateMany("key", "r2"))
										: dataHolders;
								}
							},
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? dataHolders.map(updateMany("key", "r3"))
										: dataHolders;
								}
							}
						];

						const expectedDataHolders = [
							createDataHolder({
								descriptor: { id: "1" },
								data: { key: ["r1", "r2", "r3"] }
							}),
							createDataHolder({
								descriptor: { id: "2" },
								data: { key: ["r1", "r2", "r3"] }
							}),
							createDataHolder({
								descriptor: { id: "3" },
								data: { key: ["r1", "r2", "r3"] }
							})
						];

						testActivityReducers({ dataReducers, expectedDataHolders });
					});
				});
			});

			describe("delete dh(s)", () => {
				describe("where one data reducer deletes multiple data holders", () => {
					it("removes all matching data holders and returns the final updated state", () => {
						const dataReducers: ActivityReducers.DataReducer[] = [
							{
								reduce(dataHolders, action) {
									return action === mockAction ? [] : dataHolders;
								}
							}
						];

						testActivityReducers({ dataReducers, expectedDataHolders: [] });
					});
				});

				describe("where multiple data reducers delete data holders", () => {
					it("removes all matching data holders and returns the final updated state", () => {
						const dataReducers: ActivityReducers.DataReducer[] = [
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? dataHolders.filter(dh => dh.descriptor.id !== "1")
										: dataHolders;
								}
							},
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? dataHolders.filter(dh => dh.descriptor.id !== "2")
										: dataHolders;
								}
							}
						];

						const expectedDataHolders = [
							createDataHolder({
								descriptor: { id: "3" }
							})
						];

						testActivityReducers({ dataReducers, expectedDataHolders });
					});
				});
			});

			describe("combination of create/update/delete changes", () => {
				describe("where multiple data reducers change one data holder in different ways", () => {
					it("executes the changes to the data holder in order of the data reducers and returns the final updated state", () => {
						// Change1 -> Remove -> Change2 (ignored) -> Create -> Change3
						const dataReducers: ActivityReducers.DataReducer[] = [
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? dataHolders.map(updateOne("firstChange"))
										: dataHolders;
								}
							},
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? dataHolders.filter(dh => dh.descriptor.id !== "1")
										: dataHolders;
								}
							},
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? dataHolders.map(updateOne("secondChange"))
										: dataHolders;
								}
							},
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? [...dataHolders, createDataHolder({ descriptor: { id: "1" } })]
										: dataHolders;
								}
							},
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? dataHolders.map(updateOne("thirdChange", "r5"))
										: dataHolders;
								}
							}
						];

						const expectedDataHolders = [
							createDataHolder({ descriptor: { id: "2" } }),
							createDataHolder({ descriptor: { id: "3" } }),
							createDataHolder({
								descriptor: { id: "1" },
								data: { thirdChange: ["r5"] }
							})
						];

						testActivityReducers({ dataReducers, expectedDataHolders });
					});
				});

				describe("where multiple data reducers change multiple data holders in different ways", () => {
					it("executes the changes to the data holders in order of the data reducers and returns the final updated state", () => {
						// Change1 -> Remove existing and create others -> Change2 (ignored) -> Create again -> Change3 -> remove others
						const dataReducers: ActivityReducers.DataReducer[] = [
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? dataHolders.map(updateMany("firstChange", "r1"))
										: dataHolders;
								}
							},
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? [
												createDataHolder({ descriptor: { other: "other1" } }),
												createDataHolder({ descriptor: { other: "other2" } })
											]
										: dataHolders;
								}
							},
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? dataHolders.map(updateMany("secondChange", "r3"))
										: dataHolders;
								}
							},
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? [
												createDataHolder({ descriptor: { id: "2" } }),
												...dataHolders,
												createDataHolder({ descriptor: { id: "1" } })
											]
										: dataHolders;
								}
							},
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? dataHolders.map(updateMany("thirdChange", "r5"))
										: dataHolders;
								}
							},
							{
								reduce(dataHolders, action) {
									return action === mockAction
										? dataHolders.filter(dh => dh.descriptor.id !== undefined)
										: dataHolders;
								}
							}
						];

						const expectedDataHolders = [
							createDataHolder({
								descriptor: { id: "2" },
								data: { thirdChange: ["r5"] }
							}),
							createDataHolder({ descriptor: { id: "1" }, data: { thirdChange: ["r5"] } })
						];

						testActivityReducers({ dataReducers, expectedDataHolders });
					});
				});
			});

			describe("where no data reducer changes any data holder", () => {
				it("calls the default activity reducers and returns the updated state", () => {
					const action = ActivityActions.setDirty({
						activityId: "1",
						dirty: true
					});

					const dataReducers: ActivityReducers.DataReducer[] = [
						{
							reduce(dataHolders, action) {
								return action === mockAction
									? [...dataHolders, createDataHolder({ descriptor: { dh: "1" } })]
									: dataHolders;
							}
						},
						{
							reduce(dataHolders, action) {
								return action === mockAction
									? [createDataHolder({ descriptor: { dh: "2" } }), ...dataHolders]
									: dataHolders;
							}
						}
					];

					const activityReducers = ActivityReducers.createActivityReducers({
						dataReducers
					});

					const newActivityMap = activityReducers(activityMap, action);
					const expectedActivityMap = handleSetDirty(activityMap, action);

					deepStrictEqual(newActivityMap, expectedActivityMap);
				});
			});
		});
	});
});

function createDRAction(): ActivityActions.DataReducerAction {
	return { type: "dr action", payload: { activityId: "1" } };
}

/**
 * Updates only the DH with descriptor id "1"
 */
function updateOne(
	propName: string,
	value?: unknown
): (dh: Activity.DataHolder<Record<string, unknown>>, idx: number) => Activity.DataHolder {
	return (dh, idx) => updateProp(dh, propName, value ?? idx, dh.descriptor.id === "1");
}

/**
 * Updates all DHs with a descriptor id
 */
function updateMany(
	propName: string,
	value?: unknown
): (dh: Activity.DataHolder<Record<string, unknown>>, idx: number) => Activity.DataHolder {
	return (dh, idx) => updateProp(dh, propName, value ?? idx, dh.descriptor.id !== undefined);
}

function updateProp(
	dh: Activity.DataHolder<Record<string, unknown>>,
	propName: string,
	newValue: unknown,
	shouldUpdate: boolean
): Activity.DataHolder {
	if (shouldUpdate) {
		const current = dh.data?.[propName];

		if (Array.isArray(current)) {
			return { ...dh, data: { ...dh.data, [propName]: current.concat(newValue) } };
		} else {
			return { ...dh, data: { ...dh.data, [propName]: [newValue] } };
		}
	} else {
		return dh;
	}
}
