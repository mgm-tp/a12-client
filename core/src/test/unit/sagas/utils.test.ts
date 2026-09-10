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

import { deepStrictEqual, throws } from "node:assert/strict";

import { expectSaga } from "redux-saga-test-plan";

import type { Activity, ActivityMap } from "../../../core/activity/index.js";
import { ActivityActions } from "../../../core/activity/index.js";
import { ActivityUtils } from "../../../core/application/internal/sagas/utils.js";
import type { DataEditor } from "../../../core/data/index.js";
import type { DataHandlersSearchResult } from "../../../core/data/internal/DataHandler.js";
import { DataUtils } from "../../../core/data/internal/DataHandler.js";
import type { ApplicationModel } from "../../../core/model/index.js";
import { createActivity } from "../../utils/activity.js";

describe("core.application.internal.sagas.utils", () => {
	describe("ActivityUtils", () => {
		describe("handleError", () => {
			describe("given an activity id, an operation type and an error", () => {
				it("dispatches an error action, with the given parameters", () => {
					const error = {
						data: "this is an error"
					};

					return expectSaga(ActivityUtils.handleError, "A", "loading", error)
						.run()
						.then(result => {
							const { effects } = result;

							deepStrictEqual(effects.put[0].payload.action, {
								type: ActivityActions.error.type,
								payload: {
									activityId: "A",
									operationType: "loading",
									error: error
								}
							});
						});
				});
			});
		});
	});

	describe("DataUtils", () => {
		describe("findMatchingDataEditorForActivity", () => {
			describe("given a child activity", () => {
				describe("and a map of activities", () => {
					describe("and data editors", () => {
						describe("and the activity descriptor of the direct parent of the child activity matches any of the data editors", () => {
							describe("and the parent activity is loaded", () => {
								it("returns the direct parent and the matching data editor", async () => {
									const data = { document: "Test" };
									const parentMatchConditions = [
										{ key: "test", mustEqual: "Test1" },
										{ key: "instance", isSet: true }
									];
									const result = setup({ parentMatchConditions, data });
									deepStrictEqual(result.dataEditor.meta.name, "TestDataLoader");
									deepStrictEqual(result.parentActivity.id, "parentActivity");
								});
							});

							describe("and the parent activity is not loaded", () => {
								it("throws an error", () => {
									const data = { document: "Test" };
									const parentMatchConditions = [
										{ key: "test", mustEqual: "Test1" },
										{ key: "instance", isSet: true }
									];

									throws(
										() =>
											setup({
												parentMatchConditions,
												data,
												parentLoaded: false
											}),
										{ message: 'Cannot handle parent loadingState "loading"' }
									);
								});

								describe("and the activity descriptor of the child activity matches any of the data editors", () => {
									it("only checks parent activities and therefore throws an error because no data editor can be found", async () => {
										const data = { document: "Test" };
										const parentMatchConditions = [
											{ key: "test", mustEqual: "Test" },
											{ key: "instance", isSet: true }
										];
										throws(
											() => setup({ parentMatchConditions, data }),
											'Could not find suitable data editor for activity {"id":"childActivity","test":"Test2","instance":"1"}'
										);
									});
								});
							});

							describe("and the activity descriptor of a non direct parent matches any of the data editors", () => {
								it("returns the the grand parent activity and the matching data editor", async () => {
									const data = { document: "Test" };
									const parentMatchConditions = [
										{ key: "test", mustEqual: "Test1" },
										{ key: "instance", isSet: false }
									];
									const result = setup({ parentMatchConditions, data });
									deepStrictEqual(result.dataEditor.meta.name, "TestDataLoader");
									deepStrictEqual(result.parentActivity.id, "grandParentActivity");
								});
							});

							describe("and the activity descriptor of the direct parent and a non direct parent matches any of the data editors", () => {
								it("returns the direct parent and the matching data editor", async () => {
									const data = { document: "Test" };
									const parentMatchConditions = [{ key: "test", mustEqual: "Test1" }];
									const result = setup({ parentMatchConditions, data });
									deepStrictEqual(result.dataEditor.meta.name, "TestDataLoader");
									deepStrictEqual(result.parentActivity.id, "parentActivity");
								});
							});

							describe("and the parent match conditions of a matching data handler is empty", () => {
								it("returns the direct parent and the matching data editor", async () => {
									const data = { document: "Test" };
									const parentMatchConditions: ApplicationModel.MatchCondition[] = [];
									const result = setup({ parentMatchConditions, data });
									deepStrictEqual(result.dataEditor.meta.name, "TestDataLoader");
									deepStrictEqual(result.parentActivity.id, "parentActivity");
								});
							});
						});

						describe("and no activity descriptor matches any data editor", () => {
							it("throws an error", async () => {
								const data = { document: "Test" };
								const parentMatchConditions = [{ key: "test", mustEqual: "AnyOtherVAlue" }];
								throws(
									() => setup({ parentMatchConditions, data }),
									'Could not find suitable data editor for activity {"id":"childActivity","test":"Test2","instance":"1"}'
								);
							});
						});
					});
				});
			});
		});

		function setup(options: {
			parentMatchConditions: ApplicationModel.MatchCondition[];
			data: object;
			parentLoaded?: boolean;
		}): DataHandlersSearchResult {
			const setup = setupDataEditorsAndActivities({
				...options
			});

			const result = DataUtils.findMatchingDataEditorForActivity(
				setup.activities["childActivity"]!,
				setup.activities,
				setup.dataEditors
			);

			return result;
		}

		function setupDataEditorsAndActivities(options: {
			parentMatchConditions: ApplicationModel.MatchCondition[];
			data: object;
			parentLoaded?: boolean;
		}): { dataEditors: DataEditor[]; activities: ActivityMap } {
			const activityADescriptor: Activity.Descriptor = {
				id: "grandParentActivity",
				test: "Test1"
			};
			const activityBDescriptor: Activity.Descriptor = {
				id: "parentActivity",
				test: "Test1",
				instance: "1"
			};
			const activityCDescriptor: Activity.Descriptor = {
				id: "childActivity",
				test: "Test2",
				instance: "1"
			};

			const activityC = createActivity({
				id: "childActivity",
				initiatingActivityId: "parentActivity",
				descriptor: activityCDescriptor
			});

			const activities: ActivityMap = {
				["grandParentActivity"]: createActivity({
					id: "grandParentActivity",
					descriptor: activityADescriptor,
					activityDataHolder: {
						loadingState: options.parentLoaded === false ? "loading" : "loaded"
					}
				}),
				["parentActivity"]: createActivity({
					id: "parentActivity",
					initiatingActivityId: "grandParentActivity",
					descriptor: activityBDescriptor,
					activityDataHolder: {
						loadingState: options.parentLoaded === false ? "loading" : "loaded"
					}
				}),
				["childActivity"]: activityC
			};

			const matchingDataEditor: DataEditor.Meta = {
				name: "TestDataLoader",
				childMatchConditions: [
					{ key: "test", mustEqual: "Test2" },
					{ key: "instance", isSet: true }
				],
				parentMatchConditions: options.parentMatchConditions
			};

			const otherDataEditor: DataEditor.Meta = {
				name: "Loader",
				childMatchConditions: [{ key: "feature", mustEqual: "Test" }],
				parentMatchConditions: [{ key: "feature", mustEqual: "Test" }]
			};

			const matchingDataEditorMock: DataEditor = {
				meta: matchingDataEditor,
				read: () => {
					return {};
				},
				write: () => {
					return {};
				}
			};

			const notMatchingDataEditorMock: DataEditor = {
				meta: otherDataEditor,
				read: () => {
					return {};
				},
				write: () => {
					return {};
				}
			};

			return {
				dataEditors: [matchingDataEditorMock, notMatchingDataEditorMock],
				activities
			};
		}
	});
});
