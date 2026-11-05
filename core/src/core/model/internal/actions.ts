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

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api";
import { actionCreatorFactory } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";
import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access";

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
