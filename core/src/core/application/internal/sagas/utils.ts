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

import type { SagaGenerator } from "typed-redux-saga";
import { call, put, select } from "typed-redux-saga";
import type { Action } from "typescript-fsa";

import { ActivityActions } from "../../../activity/internal/actions.js";
import { Activity } from "../../../activity/internal/activity.js";
import { dynamicSceneReferenceByActivityDescriptors } from "../../../configurationNG/internal/dynamicSelectors.js";
import type { ApplicationModel } from "../../../model/internal/ApplicationModel.js";
import { InternalModelSelectors } from "../../../model/internal/selectors.js";
import { isRecord } from "../../../utils.js";

function isHttpResponseInfo(value: unknown): value is Activity.Error.HttpResponseInfo {
	return isRecord(value) && typeof value.status === "number" && typeof value.url === "string";
}

interface ExtendedHttpError extends Activity.Error.Http {
	readonly originalError: unknown;
}

/** @internal */
export const ActivityUtils = {
	*handleError(
		activityId: string,
		operationType: "loading" | "saving",
		error: unknown
	): SagaGenerator<void> {
		if (isHttpResponseInfo(error)) {
			const httpError: ExtendedHttpError = {
				errorCode: "HTTP_ERROR",
				httpResponseDetails: {
					status: error.status,
					url: error.url,
					headers: new Headers(error.headers)
				},
				originalError: error
			};

			yield* put(ActivityActions.error({ activityId, operationType, error: httpError }));
		} else {
			yield* put(ActivityActions.error({ activityId, operationType, error }));
		}
	},

	/**
	 * Creates a push action with the given descriptor.
	 *
	 * The loadingState is determined from the current matching scene, if `withoutData` is not set.
	 *
	 * NOTE: Determining the loadingState might not be possible if the (dynamic) scene
	 * doesn't exist at this point. For non-dynamic scenes, an error is thrown in this case.
	 */
	*createInitialActivity(
		initialActivity: ApplicationModel.InitialActivity
	): SagaGenerator<Action<ActivityActions.PushPayload>> {
		const { descriptor, withoutData } = initialActivity;
		const pushAction = ActivityActions.create({
			activityDescriptor: descriptor,
			loadingState: withoutData ? "without" : undefined
		});
		return withoutData ? pushAction : yield* call(ActivityUtils.determineLoadingState, pushAction);
	},

	*determineLoadingState(
		action: Action<ActivityActions.PushPayload>
	): SagaGenerator<Action<ActivityActions.PushPayload>> {
		const {
			payload: { activity }
		} = action;

		const allDataHolders = activity.dataHolders;
		const activityDataHolder = allDataHolders.find(
			Activity.DataHolder.hasDescriptor(activity.descriptor)
		);
		const otherDataHolders = allDataHolders.filter(
			Activity.DataHolder.hasNotDescriptor(activity.descriptor)
		);

		if (activityDataHolder === undefined) {
			throw Error(
				`No data holder could be found for activity ${activity.id} with descriptor ${JSON.stringify(activity.descriptor)}.`
			);
		}

		const loadingState = yield* call(ActivityUtils.determineLoadingStateFromScene, activity);

		const result: Action<ActivityActions.PushPayload> = {
			...action,
			payload: {
				...action.payload,
				activity: {
					...activity,
					dataHolders: [
						...otherDataHolders,
						{
							...activityDataHolder,
							loadingState
						}
					]
				}
			}
		};
		return result;
	},

	/**
	 * It looks in the matching scene if models or loadData flag is specified.
	 *
	 * @returns the activity's loading state. If data loading is required, it returns "missing".
	 * Otherwise, it returns "without".
	 */
	*determineLoadingStateFromScene(activity: Activity): SagaGenerator<"missing" | "without"> {
		function hasLoadData(directives: ReadonlyArray<ApplicationModel.Directive> = []) {
			return directives.some(
				directive => directive.type === "VIEW_ADD" && directive.loadData === true
			);
		}

		const modelDescriptors = yield* select(
			InternalModelSelectors.modelDescriptorsByActivity(activity)
		);

		if (modelDescriptors.length > 0) {
			return "missing";
		}

		const sceneReference = yield* select(
			InternalModelSelectors.sceneReferenceByActivities([activity])
		);

		if (sceneReference === undefined) {
			// if a dynamic scene matches, just return
			// because the code afterwards only checks for the existence of "loadData", which does not exist in a dynamic scene
			if (yield* select(dynamicSceneReferenceByActivityDescriptors([activity.descriptor]))) {
				return "without";
			}

			throw new Error(
				`No scene reference found for activity ${activity.id} with descriptor ${JSON.stringify(activity.descriptor)}.`
			);
		}

		const scene = yield* select(InternalModelSelectors.sceneByReference(sceneReference));

		const onlyDataLoading = scene.sceneChange
			? hasLoadData(scene.sceneChange.onEnter) || hasLoadData(scene.sceneChange.onExit)
			: false;

		return onlyDataLoading ? "missing" : "without";
	}
};
