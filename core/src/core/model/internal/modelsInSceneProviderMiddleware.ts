// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/Relationship/ModelGraph.js";

import { ActivityActions } from "../../activity/internal/actions.js";
import { StoreFactories } from "../../store/internal/factories.js";

import { ReferencedModel } from "./ReferencedModel.js";
import { ModelSelectors } from "./selectors.js";

/**
 * Same as `ActivityActionPayload`, but additionally contains the model graph and referenced models of the current scene
 *
 * Each model is of type:
 * - `Model` when already loaded successfully
 * - `Model.Descriptor` when not loaded yet
 * - `Model.Error` when loading failed
 *
 * The Model Graph is provided as well to be able to work with the model descriptors (for example,
 * to look up referenced models with it)
 *
 * @experimental
 */
export interface ActivityActionWithModelsInScenePayload
	extends ActivityActions.ActivityActionPayload {
	readonly modelsInScene: ReferencedModel.Instance[];
	readonly modelGraph: ModelGraph;
}

/**
 * @experimental
 */
export function isActivityActionWithModelsInScenePayload(
	payload: unknown
): payload is ActivityActionWithModelsInScenePayload {
	return (
		ActivityActions.ActivityActionPayload.isInstance(payload) &&
		"modelsInScene" in payload &&
		isModelsInSceneArray(payload.modelsInScene)
	);
}

/**
 * Same as `AsyncActivityActionPayload`, but additionally contains the model graph and referenced models of the current scene
 * @experimental
 */
export interface AsyncActivityActionWithModelsInScenePayload
	extends ActivityActions.AsyncActivityActionPayload {
	readonly params: ActivityActionWithModelsInScenePayload;
}

/**
 * @experimental
 */
export function isAsyncActivityActionWithModelsInScenePayload(
	payload: unknown
): payload is AsyncActivityActionWithModelsInScenePayload {
	return (
		ActivityActions.AsyncActivityActionPayload.isInstance(payload) &&
		"modelsInScene" in payload.params &&
		isModelsInSceneArray(payload.params.modelsInScene)
	);
}

/**
 * @experimental
 */
export function extractModelsInScenePayload(
	action: unknown
): ActivityActionWithModelsInScenePayload | undefined {
	return ActivityActions.DataReducerAction.isInstance(action)
		? isActivityActionWithModelsInScenePayload(action.payload)
			? action.payload
			: isAsyncActivityActionWithModelsInScenePayload(action.payload)
				? action.payload.params
				: undefined
		: undefined;
}

function isModelsInSceneArray(value: unknown): value is ReferencedModel.Instance[] {
	return Array.isArray(value) && value.every(ReferencedModel.isInstance);
}

/**
 * For all actions that contain an activityId in their payload, enhances the payload
 * with the referenced models of the scene for this activity and the modelgraph.
 *
 * This is done to allow the reducer to access them.
 *
 * Note that depending on their loading state, a referenced model of the scene might be an error or just a descriptor.
 * @internal
 */
export const modelsInSceneProviderMiddleware = StoreFactories.createMiddleware(
	(api, next, action) => {
		if (ActivityActions.DataReducerAction.isInstance(action)) {
			const activityId = ActivityActions.DataReducerAction.getActivityId(action);

			const modelsInScene = ModelSelectors.referencedModelsInScene(activityId)(api.getState());
			const modelGraph = ModelSelectors.modelGraph()(api.getState());

			const enhancedPayload = ActivityActions.ActivityActionPayload.isInstance(action.payload)
				? ({
						...action.payload,
						modelGraph,
						modelsInScene
					} satisfies ActivityActionWithModelsInScenePayload)
				: ({
						...action.payload,
						params: {
							...action.payload.params,
							modelGraph,
							modelsInScene
						}
					} satisfies AsyncActivityActionWithModelsInScenePayload);

			return next({
				...action,
				payload: enhancedPayload
			});
		}

		return next(action);
	}
);
