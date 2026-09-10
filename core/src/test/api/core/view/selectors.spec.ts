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

import { deepStrictEqual, strictEqual, throws } from "node:assert/strict";

import type { ActivityMap } from "../../../../core/activity/index.js";
import type { ApplicationModel } from "../../../../core/model/index.js";
import { ViewSelectors } from "../../../../core/view/index.js";
import { createActivity } from "../../../utils/activity.js";
import { US_LOCALE } from "../../../utils/localization.js";
import type { ClientState } from "../../../utils/test-utils.js";

import AppModel from "./mocks/ApplicationModel.js";
import AppModelWithPriorScenes from "./mocks/ApplicationModelWithPriorScenes.js";

describe("core.view.selectors", () => {
	describe("region", () => {
		describe("Given an Application Model containing scenes without prior scenes", () => {
			const initialState = createInitialState(AppModel);

			it("returns all activities when activities have no onNext-clear case and are in a linear list", () => {
				const activities: ActivityMap = {
					A: createActivity({
						id: "A",
						descriptor: { model: "MODEL_A_NOTHING" },
						activationTimestamp: 1200
					}),
					B: createActivity({
						id: "B",
						descriptor: { model: "MODEL_A_NOTHING" },
						initiatingActivityId: "A",
						activationTimestamp: 1100
					})
				};

				const state = { ...initialState, activities };

				const region = ViewSelectors.region(["CONTENT"])(state);
				deepStrictEqual(
					region.views.map(({ name, activityId }) => ({ name, activityId })),
					[
						{ name: "OverviewCRUD", activityId: "A" },
						{ name: "OverviewCRUD", activityId: "B" }
					]
				);
			});

			it("returns one activity when activity has onNext-clear case", () => {
				const activities: ActivityMap = {
					A: createActivity({
						id: "A",
						descriptor: { model: "MODEL_A_C" },
						activationTimestamp: 1200
					}),
					B: createActivity({
						id: "B",
						descriptor: { model: "MODEL_A_C" },
						initiatingActivityId: "A",
						activationTimestamp: 1200
					})
				};

				const state = { ...initialState, activities };

				const region = ViewSelectors.region(["CONTENT"])(state);
				deepStrictEqual(
					region.views.map(({ name, activityId }) => ({ name, activityId })),
					[{ name: "OverviewCRUD", activityId: "B" }]
				);
			});

			it("returns one activity when activity has onEnter-clear case", () => {
				const activities: ActivityMap = {
					A: createActivity({
						id: "A",
						descriptor: { model: "MODEL_CA_NOTHING" },
						activationTimestamp: 1200
					}),
					B: createActivity({
						id: "B",
						descriptor: { model: "MODEL_CA_NOTHING" },
						initiatingActivityId: "A",
						activationTimestamp: 1200
					})
				};

				const state = { ...initialState, activities };

				const region = ViewSelectors.region(["CONTENT"])(state);
				deepStrictEqual(
					region.views.map(({ name, activityId }) => ({ name, activityId })),
					[{ name: "OverviewCRUD", activityId: "B" }]
				);
			});

			it("returns one activity when onNext-clear case of parent is executed in a tree", () => {
				const activities: ActivityMap = {
					A: createActivity({
						id: "A",
						descriptor: { model: "MODEL_CA_NOTHING" }
					}),
					B: createActivity({
						id: "B",
						descriptor: { model: "MODEL_CA_C" },
						initiatingActivityId: "A",
						activationTimestamp: 1100
					}),
					C: createActivity({
						id: "C",
						descriptor: { model: "MODEL_A_NOTHING" },
						initiatingActivityId: "A",
						activationTimestamp: 1200
					}),
					D: createActivity({
						id: "D",
						descriptor: { model: "MODEL_A_NOTHING" },
						initiatingActivityId: "B",
						activationTimestamp: 1300
					})
				};

				const state = { ...initialState, activities };

				const region = ViewSelectors.region(["CONTENT"])(state);
				deepStrictEqual(
					region.views.map(({ name, activityId }) => ({ name, activityId })),
					[{ name: "OverviewCRUD", activityId: "D" }]
				);
			});

			it("returns all activities after the first onNext-clear case of parent", () => {
				const activities: ActivityMap = {
					A: createActivity({
						id: "A",
						descriptor: { model: "MODEL_CA_C" }
					}),
					B: createActivity({
						id: "B",
						descriptor: { model: "MODEL_A_NOTHING" },
						initiatingActivityId: "A"
					}),
					C: createActivity({
						id: "C",
						descriptor: { model: "MODEL_A_NOTHING" },
						initiatingActivityId: "A"
					})
				};

				const state = { ...initialState, activities };

				const region = ViewSelectors.region(["CONTENT"])(state);
				deepStrictEqual(
					region.views.map(({ name, activityId }) => ({ name, activityId })),
					[
						{ name: "OverviewCRUD", activityId: "B" },
						{ name: "OverviewCRUD", activityId: "C" }
					]
				);
			});

			it("returns all activities in correct order in forest", () => {
				const activities: ActivityMap = {
					A: createActivity({
						id: "A",
						descriptor: { model: "MODEL_A_NOTHING" },
						activationTimestamp: 1000
					}),
					B: createActivity({
						id: "B",
						descriptor: { model: "MODEL_A_NOTHING" },
						initiatingActivityId: "A",
						activationTimestamp: 1200
					}),
					C: createActivity({
						id: "C",
						descriptor: { model: "MODEL_A_NOTHING" },
						activationTimestamp: 1100
					}),
					D: createActivity({
						id: "D",
						descriptor: { model: "MODEL_A_NOTHING" },
						initiatingActivityId: "B"
					})
				};

				const state = { ...initialState, activities };

				const region = ViewSelectors.region(["CONTENT"])(state);
				deepStrictEqual(
					region.views.map(({ name, activityId }) => ({ name, activityId })),
					[
						{ name: "OverviewCRUD", activityId: "A" },
						{ name: "OverviewCRUD", activityId: "C" },
						{ name: "OverviewCRUD", activityId: "B" },
						{ name: "OverviewCRUD", activityId: "D" }
					]
				);
			});

			it("throws an error, when an unknown regionReference is given", () => {
				const message = "region not found: [NOT_EXISTING_REGION]";
				throws(() => ViewSelectors.region(["NOT_EXISTING_REGION"])(initialState), {
					message
				});
			});
		});

		describe("Given an Application Model containing scenes with prior scenes", () => {
			const initialState = createInitialState(AppModelWithPriorScenes);

			it("returns all activities when activities have no onExit-clear case and are in a linear list", () => {
				const activities: ActivityMap = {
					A: createActivity({
						id: "A",
						descriptor: { model: "MODEL_A_NOTHING" },
						activationTimestamp: 1200
					}),
					B: createActivity({
						id: "B",
						descriptor: { model: "MODEL_A_NOTHING", instance: "5" },
						initiatingActivityId: "A",
						activationTimestamp: 1100
					})
				};

				const state = { ...initialState, activities };

				const region = ViewSelectors.region(["CONTENT"])(state);
				deepStrictEqual(
					region.views.map(({ name, activityId }) => ({ name, activityId })),
					[
						{ name: "OverviewCRUD", activityId: "A" },
						{ name: "OverviewCRUD", activityId: "B" }
					]
				);
			});

			it("returns one activity when activity has onExit-clear case", () => {
				const activities: ActivityMap = {
					A: createActivity({
						id: "A",
						descriptor: { model: "MODEL_A_C" },
						activationTimestamp: 1200
					}),
					B: createActivity({
						id: "B",
						descriptor: { model: "MODEL_A_C", instance: "5" },
						initiatingActivityId: "A",
						activationTimestamp: 1200
					})
				};

				const state = { ...initialState, activities };

				const region = ViewSelectors.region(["CONTENT"])(state);
				deepStrictEqual(
					region.views.map(({ name, activityId }) => ({ name, activityId })),
					[{ name: "OverviewCRUD", activityId: "B" }]
				);
			});

			it("returns one activity when activity has onEnter-clear case", () => {
				const activities: ActivityMap = {
					A: createActivity({
						id: "A",
						descriptor: { model: "MODEL_CA_NOTHING" },
						activationTimestamp: 1200
					}),
					B: createActivity({
						id: "B",
						descriptor: { model: "MODEL_CA_NOTHING", instance: "5" },
						initiatingActivityId: "A",
						activationTimestamp: 1200
					})
				};

				const state = { ...initialState, activities };

				const region = ViewSelectors.region(["CONTENT"])(state);
				deepStrictEqual(
					region.views.map(({ name, activityId }) => ({ name, activityId })),
					[{ name: "OverviewCRUD", activityId: "B" }]
				);
			});

			it("returns one activity when onExit-clear case of parent is executed in a tree", () => {
				const activities: ActivityMap = {
					A: createActivity({
						id: "A",
						descriptor: { model: "MODEL_CA_C" }
					}),
					B: createActivity({
						id: "B",
						descriptor: { model: "MODEL_CA_C", instance: "5" },
						initiatingActivityId: "A",
						activationTimestamp: 1100
					}),
					C: createActivity({
						id: "C",
						descriptor: { model: "MODEL_A_NOTHING" },
						activationTimestamp: 1200
					}),
					D: createActivity({
						id: "D",
						descriptor: { model: "MODEL_CA_C", flag: "6" },
						initiatingActivityId: "B",
						activationTimestamp: 1300
					})
				};

				const state = { ...initialState, activities };

				const region = ViewSelectors.region(["CONTENT"])(state);
				deepStrictEqual(
					region.views.map(({ name, activityId }) => ({ name, activityId })),
					[{ name: "OverviewCRUD", activityId: "D" }]
				);
			});

			it("returns all activities after the first onExit-clear case of parent", () => {
				const activities: ActivityMap = {
					A: createActivity({
						id: "A",
						descriptor: { model: "MODEL_CA_C" }
					}),
					B: createActivity({
						id: "B",
						descriptor: { model: "MODEL_CA_C", instance: "5" },
						initiatingActivityId: "A"
					}),
					C: createActivity({
						id: "C",
						descriptor: { model: "MODEL_CA_C", instance: "6" },
						initiatingActivityId: "A"
					})
				};

				const state = { ...initialState, activities };

				const region = ViewSelectors.region(["CONTENT"])(state);
				deepStrictEqual(
					region.views.map(({ name, activityId }) => ({ name, activityId })),
					[
						{ name: "OverviewCRUD", activityId: "B" },
						{ name: "OverviewCRUD", activityId: "C" }
					]
				);
			});

			it("returns all activities in correct order in forest", () => {
				const activities: ActivityMap = {
					A: createActivity({
						id: "A",
						descriptor: { model: "MODEL_A_NOTHING" },
						activationTimestamp: 1000
					}),
					B: createActivity({
						id: "B",
						descriptor: { model: "MODEL_A_NOTHING", instance: "5" },
						initiatingActivityId: "A",
						activationTimestamp: 1200
					}),
					C: createActivity({
						id: "C",
						descriptor: { model: "MODEL_A_NOTHING" },
						activationTimestamp: 1100
					}),
					D: createActivity({
						id: "D",
						descriptor: { model: "MODEL_A_NOTHING", flag: "6" },
						initiatingActivityId: "B"
					})
				};

				const state = { ...initialState, activities };

				const region = ViewSelectors.region(["CONTENT"])(state);
				deepStrictEqual(
					region.views.map(({ name, activityId }) => ({ name, activityId })),
					[
						{ name: "OverviewCRUD", activityId: "A" },
						{ name: "OverviewCRUD", activityId: "C" },
						{ name: "OverviewCRUD", activityId: "B" },
						{ name: "OverviewCRUD", activityId: "D" }
					]
				);
			});
		});
	});

	describe("sceneReferenceByActivityId", () => {
		const initialState = createInitialState(AppModel);
		const activities: ActivityMap = {
			A: createActivity({
				id: "A",
				descriptor: { model: "MODEL_A_NOTHING" },
				activationTimestamp: 1000
			}),
			B: createActivity({
				id: "B",
				descriptor: { model: "MODEL_A_NOTHING", instance: "5" },
				initiatingActivityId: "A",
				activationTimestamp: 1200
			})
		};
		const state = { ...initialState, activities };

		describe("given a known ActivityId", () => {
			it("returns the matched sceneReference of the activity", () => {
				deepStrictEqual(ViewSelectors.sceneReferenceByActivityId("A")(state), {
					moduleName: "Model 1: onEnter(Add), onExit()",
					flowName: "Model1Flow1",
					sceneName: "MODEL_A_NOTHING"
				});
			});
		});

		describe("given an unknown ActivityId", () => {
			it("returns undefined", () => {
				strictEqual(ViewSelectors.sceneReferenceByActivityId("C")(state), undefined);
			});
		});
	});
});

function createInitialState(applicationModel: ApplicationModel): ClientState {
	return {
		models: {
			applicationModel: applicationModel,
			models: {},
			modelGraph: { documentModels: [], relationshipModels: [], composeDocumentModels: [] }
		},
		activities: {},
		locale: US_LOCALE,
		application: { busy: false, registeredModules: [] },
		notifications: []
	};
}
