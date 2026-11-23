// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { actionCreatorFactory } from "typescript-fsa";

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/Relationship/ModelGraph.js";

import type { ApplicationModel } from "./ApplicationModel.js";
import type { Model } from "./Model.js";

const factory = actionCreatorFactory("Model");

/**
 * These actions are payloads of information that send data about the {@link ApplicationModel}
 * to the Redux store.
 */
export namespace ModelActions {
	/**
	 * Action to set a `ModelGraph`
	 *
	 * Use to initially set the ModelGraph during application initialization or after login. You can also replace
	 * the Model Graph in a running application, but you must then ensure a consistent application state.
	 */
	export const setModelGraph = factory<SetModelGraphPayload>("SET_MODEL_GRAPH");

	export type SetModelGraphPayload = ModelGraph;

	/**
	 * Action to set an {@link ApplicationModel}
	 *
	 * It is currently not supported to replace an already present ApplicationModel during runtime.
	 * Therefore, this action should only be used to initially set the ApplicationModel during application initialization.
	 */
	export const setApplicationModel = factory<SetApplicationModelPayload>("SET_APPLICATION_MODEL");

	export interface SetApplicationModelPayload {
		readonly model: ApplicationModel;
	}

	/** Action to add the ApplicationModel of a Module to the existing ApplicationModel. */
	export const addModulesApplicationModels = factory<AddModulesApplicationModelsPayload>(
		"ADD_MODULES_APPLICATION_MODEL"
	);

	export interface AddModulesApplicationModelsPayload {
		readonly models: ApplicationModel[];
	}

	/** Action to remove the ApplicationModel of a Module from the existing ApplicationModel. */
	export const removeModuleApplicationModels = factory<RemoveModuleApplicationModelPayload>(
		"REMOVE_MODULE_APPLICATION_MODEL"
	);

	export interface RemoveModuleApplicationModelPayload {
		readonly model: ApplicationModel;
	}

	/**
	 * This action can be used to trigger loading of models if it is necessary to
	 * load models that are not referenced in any application model. Therefore, the
	 * client itself will not use this action.
	 */
	export const loadModels = factory<Model.Descriptor[]>("LOAD_MODELS");

	/**
	 * This action is used to set models into the model state. For every provided
	 * model it is required to provide all its transitive referenced models that
	 * are not loaded yet. This is necessary in order to guarantee always a valid
	 * model state.
	 *
	 * If an error occurs during the loading of a model, the error should be provided
	 * as a {@link Model.Error} instead of the model. This is required in order to
	 * allow other components, that wait for models, to stop their waiting.
	 * The reason for this is that, in contrast to the data holders, the model
	 * state has no loading state. A model is either available, not available,
	 * or an error exists.
	 *
	 * **IMPORTANT:**
	 * In order to prevent interference with the default model loading of the client
	 * only models that are not referenced by the application model and their
	 * transitive dependencies should be set.
	 *
	 * **NOTE:**
	 * For setting the application model use the {@link setApplicationModel} action.
	 */
	export const setModels = factory<SetModelsPayload>("SET");

	export interface SetModelsPayload {
		readonly [modelName: string]: ModelAPI | Model.Error | undefined;
	}
}
