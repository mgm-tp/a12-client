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

import type { Action } from "redux";

import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access";

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

/**
 * Strips `modelGraph` and `modelsInScene` from activity action payloads before
 * they are logged by Redux DevTools, keeping the serialized state manageable.
 */
export function actionSanitizer<A extends Action>(a: A): A {
	if (!ActivityActions.DataReducerAction.isInstance(a)) {
		return a;
	}

	const payloadWithModels = extractModelsInScenePayload(a);
	if (!payloadWithModels) {
		return a;
	}

	const { modelGraph, modelsInScene, ...rest } = payloadWithModels;

	// async actions have a payload with a `params` property that contains the
	// actual payload, while sync actions have the payload directly on the
	// `payload` property. We need to handle both cases to properly sanitize the
	// actions.
	return isAsyncActivityActionWithModelsInScenePayload(a.payload)
		? {
				...a,
				payload: {
					...a.payload,
					params: rest
				}
			}
		: { ...a, payload: rest };
}
