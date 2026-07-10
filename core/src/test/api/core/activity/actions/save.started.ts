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

import type { Action } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";

import { Activity, ActivityActions, ActivityReducers } from "../../../../../core/activity/index.js";
import { createActivity, createDataHolder } from "../../../../utils/activity.js";

import { selectActivity } from "../reducer-test-utils.js";
import { setupActivityMap } from "../util.js";

export function executeTestForSaveStarted(): void {
	const ad = { d: "activityDescriptor" } as Activity.DataHolderDescriptor;
	const d1 = { d: "1" } as Activity.DataHolderDescriptor;
	const d2 = { d: "2" } as Activity.DataHolderDescriptor;
	const d3 = { d: "3" } as Activity.DataHolderDescriptor;
	const d4 = { d: "4" } as Activity.DataHolderDescriptor;

	function runTest(props: {
		readonly action: Action<ActivityActions.SaveDataPayload>;
		readonly changedDHDescriptors: Activity.DataHolderDescriptor[];
		readonly dataHolderState?: Partial<Activity.DataHolder<{}>>;
	}) {
		const { action, changedDHDescriptors, dataHolderState } = props;

		const activityDataHolders = [
			createDataHolder({
				...dataHolderState,
				descriptor: ad
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

		const state = setupActivityMap([
			createActivity({
				id: "1",
				descriptor: ad,
				dataHolders: activityDataHolders
			})
		]);

		const actualActivityMap = ActivityReducers.activities(state, action);

		if (changedDHDescriptors.length) {
			const { dataHolders } = selectActivity(actualActivityMap)("1") ?? {};

			strictEqual(dataHolders?.length, activityDataHolders.length);

			dataHolders?.forEach(dh => {
				const oldDH = activityDataHolders.find(Activity.DataHolder.hasDescriptor(dh.descriptor));

				const [expectedSavingState, expectedBusyState] = changedDHDescriptors.includes(
					dh.descriptor
				)
					? ["saving", true]
					: [oldDH?.savingState, oldDH?.busy];

				strictEqual(dh.savingState, expectedSavingState);
				strictEqual(dh.busy, expectedBusyState);
			});
		} else {
			deepStrictEqual(actualActivityMap, state);
		}
	}

	describe("when the action payload contains an activityId that refers to an existing activity", () => {
		describe("and no dataHolder descriptors", () => {
			const action = ActivityActions.save.started({ activityId: "1" });

			describe("and the default DH of the activity has the loadingState 'loaded' and a savingState other than 'saving'", () => {
				it("returns a new ActivityMap, in which the default DH of the activity now has the savingState 'saving' and is busy", () => {
					runTest({
						action,
						changedDHDescriptors: [ad],
						dataHolderState: { loadingState: "loaded", savingState: "not_saved" }
					});
				});
			});

			describe("and the default DH of the activity has the loadingState 'loaded' and a savingState 'saving' and is not busy", () => {
				it("returns a new ActivityMap, in which the default DH of the activity keeps its savingState and now is busy", () => {
					runTest({
						action,
						changedDHDescriptors: [ad],
						dataHolderState: { loadingState: "loaded", savingState: "saving", busy: false }
					});
				});
			});

			describe("and the default DH of the activity has the loadingState 'loaded' and the savingState 'saving' and is busy", () => {
				it("returns a new unchanged ActivityMap", () => {
					runTest({
						action,
						changedDHDescriptors: [],
						dataHolderState: { loadingState: "loaded", savingState: "saving", busy: true }
					});
				});
			});

			describe("and the default DH of the activity has a loadingState other than 'loaded'", () => {
				it("returns a new unchanged ActivityMap", () => {
					runTest({
						action,
						changedDHDescriptors: [],
						dataHolderState: { loadingState: "loading" }
					});
				});
			});
		});

		describe("and additional dataHolder descriptors", () => {
			const action = ActivityActions.save.started({
				activityId: "1",
				dataHolderDescriptors: [d2, d4]
			});

			describe("that have the loadingState 'loaded' and a savingState other than 'saving'", () => {
				it("returns a new ActivityMap, in which only the specified dataholders now have the savingState 'saving' and are busy", () => {
					runTest({
						action,
						changedDHDescriptors: [d2, d4],
						dataHolderState: { loadingState: "loaded", savingState: "not_saved" }
					});
				});
			});

			describe("that have loadingState 'loaded' and a savingState 'saving' and are not busy", () => {
				it("returns a new ActivityMap, in which only the specified dataholders keep their savingState and now are busy", () => {
					runTest({
						action,
						changedDHDescriptors: [d2, d4],
						dataHolderState: { loadingState: "loaded", savingState: "saving", busy: false }
					});
				});
			});

			describe("that have the loadingState 'loaded' and the savingState 'saving' and are busy", () => {
				it("returns a new unchanged ActivityMap", () => {
					runTest({
						action,
						changedDHDescriptors: [],
						dataHolderState: { loadingState: "loaded", savingState: "saving", busy: true }
					});
				});
			});

			describe("that have a loadingState other than 'loaded'", () => {
				it("returns a new unchanged ActivityMap", () => {
					runTest({
						action,
						changedDHDescriptors: [],
						dataHolderState: { loadingState: "loading" }
					});
				});
			});
		});
	});

	describe("when the action payload contains an activityId that refers to an non-existing activity", () => {
		it("returns a new unchanged ActivityMap", () => {
			const action = ActivityActions.save.started({ activityId: "doesNotExist" });

			runTest({ action, changedDHDescriptors: [] });
		});
	});
}
