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

import { strictEqual, deepStrictEqual } from "node:assert/strict";

import type { ApplicationModel } from "../../../../core/model/index.js";
import { ModelActions, ModelReducers } from "../../../../core/model/index.js";
import type { ModelState } from "../../../../core/model/internal/ModelState.js";

describe("core.model", () => {
	const state: ModelState = {
		applicationModel: {
			header: {
				id: "ApplicationModel",
				modelType: "application",
				modelVersion: "1.0.0"
			},
			content: {
				region: {
					name: "APP",
					layout: { name: "ApplicationFrame" }
				},
				defaultRegion: [],
				modules: []
			}
		},
		modelGraph: {
			documentModels: [],
			relationshipModels: [],
			composeDocumentModels: []
		},
		models: {}
	};

	describe("ModelReducers", () => {
		describe("models", () => {
			describe("Given an model state", () => {
				describe("Given an action of type ModelActions.setApplicationModel", () => {
					describe("When the action's payload contains a new application model", () => {
						const newApplicationModel: ApplicationModel = {
							header: {
								id: "NewApplicationModel",
								modelType: "application",
								modelVersion: "1.0.0"
							},
							content: {
								region: { name: "APP", layout: { name: "ApplicationFrame" } },
								defaultRegion: [],
								modules: []
							}
						};

						const payload: ModelActions.SetApplicationModelPayload = {
							model: newApplicationModel
						};

						it(
							"returns an updated model state with the given application model from the " +
								"action's payload as new application model",
							() => {
								const newState = ModelReducers.models(
									state,
									ModelActions.setApplicationModel(payload)
								);
								deepStrictEqual(newState, {
									...state,
									applicationModel: newApplicationModel
								});
							}
						);

						it("returns the given state if no update is needed", () => {
							const firstUpdate = ModelReducers.models(
								state,
								ModelActions.setApplicationModel(payload)
							);
							const secondUpdate = ModelReducers.models(
								firstUpdate,
								ModelActions.setApplicationModel(payload)
							);

							strictEqual(firstUpdate, secondUpdate, "Expected that there is no state update");
						});
					});
				});

				describe("Given an action whose type is not ModelActions.setApplicationModel", () => {
					const newState = ModelReducers.models(state, { type: "DummyAction" });

					it("returns the given model state without any applied changes", () => {
						deepStrictEqual(newState, state);
					});
				});
			});
		});
	});
});
