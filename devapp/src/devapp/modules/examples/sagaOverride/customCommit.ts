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
import { isType } from "typescript-fsa";

import type { ApplicationSaga, DataLoader } from "@com.mgmtp.a12.client/client-core";
import {
	Activity,
	ActivityActions,
	ActivitySelectors,
	isDataLoader
} from "@com.mgmtp.a12.client/client-core";

import { customCommitDataLoader } from "./customCommitDataLoader.js";

export function commitActivitySaga(
	config: ApplicationSaga.Configuration
): ApplicationSaga.Descriptor {
	return {
		canHandle: (ad: Activity.Descriptor, action: Action<{}>) => {
			return isType(action, ActivityActions.commit.started) && customCommitDataLoader.canHandle(ad);
		},
		handle: (action: Action<ActivityActions.ActivityActionPayload>) => {
			return handleCommitActivity(config, action);
		}
	};
}

// this custom commit implementation will try to write the data using
// first the data loader and
// then update the source activity
function* handleCommitActivity(
	config: ApplicationSaga.Configuration,
	action: Action<ActivityActions.ActivityActionPayload>
): SagaGenerator<void> {
	const activity = yield* select(ActivitySelectors.activityById(action.payload.activityId));

	try {
		const activities = yield* select(ActivitySelectors.activities());

		if (activity !== undefined && ActivitySelectors.loadingState(activity).state === "loaded") {
			const dataLoader = config.dataHandlers.find(
				handler => isDataLoader(handler) && handler.canHandle(activity.descriptor, activities)
			) as DataLoader;

			if (dataLoader === undefined) {
				return yield* call(
					failCommit,
					{ activityId: activity.id },
					`No DataLoader supports activity descriptor "${JSON.stringify(activity.descriptor)}".`
				);
			} else {
				const data = Activity.findDefaultDataHolder(activity)?.data;
				const datasourceActivityId = Activity.findDefaultDataHolder(activity)?.datasourceActivityId;

				const dataLoaderSaveResult = yield* call(
					[dataLoader, "save"],
					activity.descriptor,
					data ?? {},
					undefined,
					[]
				);

				if (datasourceActivityId !== undefined) {
					const datasourceActivity = yield* select(
						ActivitySelectors.activityById(datasourceActivityId)
					);

					if (datasourceActivity === undefined) {
						return yield* call(
							failCommit,
							{ activityId: activity.id },
							`Cannot save data because source activity ${datasourceActivityId} is not active`
						);
					}

					const loadingState = Activity.findDefaultDataHolder(datasourceActivity)?.loadingState;

					if (loadingState !== "loaded") {
						return yield* call(
							failCommit,
							{ activityId: activity.id },
							`Cannot handle source loadingState "${loadingState}"`
						);
					}

					yield* put(
						ActivityActions.setData({
							activityId: datasourceActivity.id,
							data: dataLoaderSaveResult
						})
					);
				}
			}
			yield* put(ActivityActions.commit.done({ params: action.payload, result: {} }));
		}
	} catch (error) {
		yield* put(ActivityActions.commit.failed({ params: action.payload, error: error as {} }));
	}
}

function* failCommit(
	activityPayload: ActivityActions.ActivityActionPayload,
	message: string
): SagaGenerator<void> {
	const error = new Error(message);
	yield* put(
		ActivityActions.commit.failed({
			params: activityPayload,
			error
		})
	);
}
