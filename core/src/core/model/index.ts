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

/**
 * This infrastructure contains modules for dealing with all A12 models. Currently, we support four
 * kinds of A12 models:
 *  - Application Model which defines the macroscopic UI aspects of the overall application
 *  - three engine models (Data, UI, Overview) which are typically used together with the Overview and Form Engine
 *
 * It provides the specification of those models as well as actions and reducers to trigger state
 * changes for them in the Redux store.
 *
 * @packageDocumentation
 */
export { ModelActions } from "./internal/actions.js";
export { ApplicationModel } from "./internal/ApplicationModel.js";
export { APPLICATION_MODEL_PLACEHOLDER } from "./internal/appModelPlaceholder.js";
export { Model, type ModelTypeGuard } from "./internal/Model.js";
export type { ModelLoader } from "./internal/ModelLoader.js";
export { documentModelProcessor } from "./internal/ModelProcessor.js";
export type { ModelProcessor } from "./internal/ModelProcessor.js";
export type { ModelMap } from "./internal/ModelState.js";
export { ModelReducers } from "./internal/reducers.js";
export { ModelSagas } from "./internal/sagas.js";
export { ModelSelectors } from "./internal/selectors.js";
export type { ModelResult, ModelSearchDescriptor } from "./internal/selectors.js";
export type { SupportedModelVersions } from "./internal/supportedModelVersions.js";

export { ModelLenses } from "./internal/model-lenses.js";
export { ReferencedModel } from "./internal/ReferencedModel.js";

export {
	extractModelsInScenePayload,
	isActivityActionWithModelsInScenePayload,
	isAsyncActivityActionWithModelsInScenePayload,
	type ActivityActionWithModelsInScenePayload,
	type AsyncActivityActionWithModelsInScenePayload
} from "./internal/modelsInSceneProviderMiddleware.js";
