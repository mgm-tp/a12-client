// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
