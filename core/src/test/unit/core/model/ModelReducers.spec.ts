// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
