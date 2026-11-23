// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Reducer } from "redux";
import type { Action, AnyAction } from "typescript-fsa";

import { ModelActions } from "./actions.js";
import type { ModelMap, ModelState } from "./ModelState.js";
import { addApplicationModels, removeApplicationModel } from "./moduleAppModel.js";

const DEFAULT_STATE: ModelState = {
	applicationModel: {
		header: {
			id: "",
			modelType: "application",
			modelVersion: "1.0.0"
		},
		content: {
			region: {
				name: "APP",
				layout: { name: "Null" }
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

export namespace ModelReducers {
	/**
	 * This reducer specifies how the `ModelState` changes in response to actions sent to the store.
	 */
	export const models: Reducer = (
		state: ModelState = DEFAULT_STATE,
		action: AnyAction
	): ModelState => {
		if (ModelActions.setModels.match(action)) {
			return handleSetModels(state, action);
		} else if (ModelActions.setApplicationModel.match(action)) {
			return handleSetApplicationModel(state, action);
		} else if (ModelActions.addModulesApplicationModels.match(action)) {
			return handleAddModulesAppModel(state, action);
		} else if (ModelActions.removeModuleApplicationModels.match(action)) {
			return handleRemoveModuleAppModel(state, action);
		} else if (ModelActions.setModelGraph.match(action)) {
			return handleModelGraph(state, action);
		}
		return state;
	};
}

function handleSetModels(
	state: ModelState,
	action: Action<ModelActions.SetModelsPayload>
): ModelState {
	if (Object.keys(action.payload).length === 0) {
		return state;
	}

	return { ...state, models: { ...state.models, ...action.payload } };
}

function handleSetApplicationModel(
	state: ModelState,
	action: Action<ModelActions.SetApplicationModelPayload>
): ModelState {
	const { model } = action.payload;
	return state.applicationModel !== model
		? {
				...state,
				applicationModel: model
			}
		: state;
}

function handleModelGraph(
	state: ModelState,
	action: Action<ModelActions.SetModelGraphPayload>
): ModelState {
	const modelGraph = action.payload;
	return modelGraph !== state.modelGraph
		? {
				...state,
				modelGraph,
				models: {
					...state.models,
					...modelGraph.relationshipModels.reduce<ModelMap>(
						(acc, cur) => ({ ...acc, [cur.header.id]: cur }),
						{}
					)
				}
			}
		: state;
}

function handleAddModulesAppModel(
	state: ModelState,
	action: Action<ModelActions.AddModulesApplicationModelsPayload>
): ModelState {
	if (action.payload.models && action.payload.models.length > 0) {
		return {
			...state,
			applicationModel: addApplicationModels(action.payload.models, state.applicationModel)
		};
	} else {
		return state;
	}
}

function handleRemoveModuleAppModel(
	state: ModelState,
	action: Action<ModelActions.RemoveModuleApplicationModelPayload>
): ModelState {
	if (action.payload.model) {
		return {
			...state,
			applicationModel: removeApplicationModel(action.payload.model, state.applicationModel)
		};
	} else {
		return state;
	}
}
