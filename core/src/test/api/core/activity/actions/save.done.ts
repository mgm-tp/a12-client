// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual, notStrictEqual, strictEqual } from "node:assert/strict";

import deepEqual from "fast-deep-equal";
import type { Action, Success } from "typescript-fsa";

import { Activity, ActivityActions, ActivityReducers } from "../../../../../core/activity/index.js";
import { createActivity, createDataHolder } from "../../../../utils/activity.js";

import { selectActivity } from "../reducer-test-utils.js";
import { setupActivityMap } from "../util.js";

export function executeTestForSaveDone(): void {
	const ad = { d: "activityDescriptor" } as Activity.DataHolderDescriptor;
	const d1 = { d: "1" } as Activity.DataHolderDescriptor;
	const d2 = { d: "2" } as Activity.DataHolderDescriptor;
	const d3 = { d: "3" } as Activity.DataHolderDescriptor;
	const d4 = { d: "4" } as Activity.DataHolderDescriptor;

	function runTest(props: {
		readonly action: Action<Success<ActivityActions.SaveDataPayload, ActivityActions.SaveResult>>;
		readonly changedDHDescriptors: Activity.DataHolderDescriptor[];
		readonly shouldActivityDescriptorInstanceUpdate?: boolean;
		readonly activityDescriptor?: Activity.Descriptor;
		readonly dataHolderState?: Partial<Activity.DataHolder<{}>>;
	}) {
		const {
			action,
			changedDHDescriptors,
			activityDescriptor,
			shouldActivityDescriptorInstanceUpdate,
			dataHolderState
		} = props;

		const activityDataHolders = [
			createDataHolder({
				...dataHolderState,
				descriptor: activityDescriptor ?? ad
			}),
			createDataHolder({
				...dataHolderState,
				descriptor: d1
			}),
			createDataHolder({
				...dataHolderState,
				descriptor: d2
			}),
			createDataHolder({
				...dataHolderState,
				descriptor: d3
			}),
			createDataHolder({
				...dataHolderState,
				descriptor: d4
			})
		];

		const existingActivity = createActivity({
			id: "1",
			descriptor: activityDescriptor ?? ad,
			dataHolders: activityDataHolders
		});

		const state = setupActivityMap([existingActivity]);

		const actualActivityMap = ActivityReducers.activities(state, action);

		if (changedDHDescriptors.length) {
			const newActivity = selectActivity(actualActivityMap)("1");
			const { dataHolders, descriptor } = newActivity ?? {};

			strictEqual(dataHolders?.length, activityDataHolders.length);

			dataHolders?.forEach(newDH => {
				const { instance, ...restDescriptor } = newDH.descriptor;

				const oldDH = activityDataHolders.find(dh => deepEqual(restDescriptor, dh.descriptor));

				const [expectedSavingState, expectedBusyState, expectedDirtyState] =
					changedDHDescriptors.find(({ instance, ...rest }) => deepEqual(rest, restDescriptor))
						? ["saved", false, false]
						: [oldDH?.savingState, oldDH?.busy, oldDH?.dirty];

				strictEqual(newDH.savingState, expectedSavingState);
				strictEqual(newDH.busy, expectedBusyState);
				strictEqual(newDH.dirty, expectedDirtyState);
			});

			if (shouldActivityDescriptorInstanceUpdate) {
				strictEqual(
					descriptor?.instance,
					action.payload.result.instance,
					"Expected activity descriptor instance to be updated"
				);

				const defaultDH = Activity.findDefaultDataHolder(newActivity);
				notStrictEqual(defaultDH, undefined, "Expected default dataholder to exist");
			} else {
				deepStrictEqual(
					descriptor,
					existingActivity.descriptor,
					"Expected activity descriptor to not be changed"
				);
			}
		} else {
			deepStrictEqual(actualActivityMap, state);
		}
	}

	describe("when the action payload contains an activityId that refers to an existing activity", () => {
		describe("and no dataHolder descriptors", () => {
			describe("and instance is provided in the action result", () => {
				const action = ActivityActions.save.done({
					params: { activityId: "1" },
					result: { instance: "deadbeef" }
				});

				describe("and the activity descriptor has a different instance", () => {
					it(`returns a new ActivityMap, in which the default DH of the activity now has the savingState 'saved' and is not busy and not dirty
						and the activity descriptor instance is updated`, () => {
						const adWithInstance = { d: "activityDescriptor", instance: "another" };

						runTest({
							action,
							activityDescriptor: adWithInstance,
							shouldActivityDescriptorInstanceUpdate: true,
							changedDHDescriptors: [adWithInstance]
						});
					});
				});

				describe("and the activity descriptor has the same instance and the activity's savingState is not 'saved'", () => {
					it(`returns a new ActivityMap, in which the default DH of the activity now has the savingState 'saved' and is not busy and not dirty
						and the activity descriptor instance is not updated`, () => {
						const adWithInstance = { d: "activityDescriptor", instance: "deadbeef" };

						runTest({
							action,
							activityDescriptor: adWithInstance,
							shouldActivityDescriptorInstanceUpdate: false,
							changedDHDescriptors: [adWithInstance],
							dataHolderState: { savingState: "saving" }
						});
					});
				});

				describe("and the activity descriptor has the same instance and the activity's savingState is 'saved'", () => {
					it("returns a new unchanged ActivityMap", () => {
						const adWithInstance = { d: "activityDescriptor", instance: "deadbeef" };

						runTest({
							action,
							activityDescriptor: adWithInstance,
							changedDHDescriptors: [],
							dataHolderState: { savingState: "saved" }
						});
					});
				});
			});

			describe("and instance is not provided in the action result", () => {
				const action = ActivityActions.save.done({
					params: { activityId: "1" },
					result: {}
				});

				describe("and the activity descriptor has an instance set", () => {
					it(`returns a new ActivityMap, in which the default DH of the activity now has the savingState 'saved' and is not busy and not dirty
						and the activity descriptor instance is not updated`, () => {
						const adWithInstance = { d: "activityDescriptor", instance: "another" };

						runTest({
							action,
							activityDescriptor: adWithInstance,
							shouldActivityDescriptorInstanceUpdate: false,
							changedDHDescriptors: [adWithInstance]
						});
					});
				});

				describe("and the activity descriptor has no instance set and the activity's savingState is not 'saved'", () => {
					it(`returns a new ActivityMap, in which the default DH of the activity now has the savingState 'saved' and is not busy and not dirty
						and the activity descriptor instance is not updated`, () => {
						runTest({
							action,
							changedDHDescriptors: [ad],
							shouldActivityDescriptorInstanceUpdate: false,
							dataHolderState: { savingState: "saving" }
						});
					});
				});

				describe("and the activity descriptor has no instance set and the activity's savingState is 'saved'", () => {
					it("returns a new unchanged ActivityMap", () => {
						runTest({
							action,
							changedDHDescriptors: [],
							dataHolderState: { savingState: "saved" }
						});
					});
				});
			});
		});

		describe("and additional dataHolder descriptors", () => {
			describe("and instance is provided in the action result", () => {
				const action = ActivityActions.save.done({
					params: { activityId: "1", dataHolderDescriptors: [d2, d4] },
					result: { instance: "deadbeef" }
				});

				describe("and the specified dataholders have a savingState that is not 'saved'", () => {
					it("returns a new ActivityMap, in which only the specified dataholders now have the savingState 'saved' and are not busy and not dirty", () => {
						runTest({
							action,
							changedDHDescriptors: [d2, d4],
							shouldActivityDescriptorInstanceUpdate: false,
							dataHolderState: { savingState: "saving" }
						});
					});

					describe("and the default dataholder is part of the specified dataholders and contains a different instance in the descriptor", () => {
						it("returns a new ActivityMap, in which only the specified dataholders are updated and the activity descriptor instance is changed", () => {
							const adWithInstance = { d: "activityDescriptor", instance: "another" };
							const action = ActivityActions.save.done({
								params: { activityId: "1", dataHolderDescriptors: [adWithInstance, d2, d4] },
								result: { instance: "deadbeef" }
							});

							runTest({
								action,
								activityDescriptor: adWithInstance,
								changedDHDescriptors: [adWithInstance, d2, d4],
								shouldActivityDescriptorInstanceUpdate: true,
								dataHolderState: { savingState: "saving" }
							});
						});
					});
				});

				describe("and the specified dataholders have a savingState that is 'saved'", () => {
					it("returns a new unchanged ActivityMap", () => {
						runTest({
							action,
							changedDHDescriptors: [],
							dataHolderState: { savingState: "saved" }
						});
					});
				});
			});
			describe("and instance is not provided in the action result", () => {
				const action = ActivityActions.save.done({
					params: { activityId: "1", dataHolderDescriptors: [d2, d4] },
					result: {}
				});

				describe("and the specified dataholders have a savingState that is not 'saved'", () => {
					it("returns a new ActivityMap, in which only the specified dataholders now have the savingState 'saved' and are not busy and not dirty", () => {
						runTest({
							action,
							changedDHDescriptors: [d2, d4],
							shouldActivityDescriptorInstanceUpdate: false,
							dataHolderState: { savingState: "saving" }
						});
					});

					describe("and the default dataholder is part of the specified dataholders and contains a different instance in the descriptor", () => {
						it("returns a new ActivityMap, in which only the specified dataholders are updated and the activity descriptor instance is not changed", () => {
							const adWithInstance = { d: "activityDescriptor", instance: "another" };
							const action = ActivityActions.save.done({
								params: { activityId: "1", dataHolderDescriptors: [adWithInstance, d2, d4] },
								result: {}
							});

							runTest({
								action,
								activityDescriptor: adWithInstance,
								changedDHDescriptors: [adWithInstance, d2, d4],
								shouldActivityDescriptorInstanceUpdate: false,
								dataHolderState: { savingState: "saving" }
							});
						});
					});
				});

				describe("and the specified dataholders have a savingState that is 'saved'", () => {
					it("returns a new unchanged ActivityMap", () => {
						runTest({
							action,
							changedDHDescriptors: [],
							dataHolderState: { savingState: "saved" }
						});
					});
				});
			});
		});
	});

	describe("when the action payload contains an activityId that refers to an non-existing activity", () => {
		it("returns a new unchanged ActivityMap", () => {
			const action = ActivityActions.save.done({
				params: { activityId: "doesNotExist" },
				result: {}
			});

			runTest({ action, changedDHDescriptors: [] });
		});
	});
}
