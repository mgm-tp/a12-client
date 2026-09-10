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
