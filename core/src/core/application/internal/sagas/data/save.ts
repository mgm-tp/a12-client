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

import deepEqual from "fast-deep-equal";
import type { Action as ReduxAction } from "redux";
import { all, call, put, select, type SagaGenerator } from "typed-redux-saga";

import type {
	Action,
	AsyncActionCreators
} from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";

import { ActivityActions } from "../../../../activity/internal/actions.js";
import type { Activity } from "../../../../activity/internal/activity.js";
import { ActivitySelectors } from "../../../../activity/internal/selectors.js";
import { isDataProvider } from "../../../../data/internal/DataHandler.js";
import { ModuleExtensions } from "../../factories/moduleExtensions.js";

import type { ApplicationSaga } from "../ApplicationSaga.js";

import { createCallDescriptors } from "./createCallDescriptors.js";

/** @internal */
export function commitStartActivitySaga(
	config: ApplicationSaga.Configuration
): ApplicationSaga.Descriptor {
	return {
		canHandle: (_: Activity.Descriptor, action: ReduxAction) =>
			ActivityActions.commit.started.match(action),
		handle: (action: Action<ActivityActions.ActivityActionPayload>) =>
			handleSaveActivity(config, action, ActivityActions.commit, false)
	};
}

/** @internal */
export function saveActivitySaga(
	config: ApplicationSaga.Configuration
): ApplicationSaga.Descriptor {
	return {
		canHandle: (_: Activity.Descriptor, action: ReduxAction) =>
			ActivityActions.save.started.match(action),
		handle: (action: Action<ActivityActions.SaveDataPayload>) =>
			handleSaveActivity(config, action, ActivityActions.save, true)
	};
}

function* handleSaveActivity(
	{ dataHandlers }: ApplicationSaga.Configuration,
	action: Action<ActivityActions.SaveDataPayload | ActivityActions.CommitPayload>,
	asyncActionCreator: AsyncActionCreators<
		ActivityActions.SaveDataPayload | ActivityActions.CommitPayload,
		{}
	>,
	updateActivityData: boolean
): SagaGenerator<void> {
	const { activityId, dataHolderDescriptors = [], ...payloadRest } = action.payload;

	const activities = yield* select(ActivitySelectors.activities());
	const moduleDps = yield* select(ModuleExtensions.getDataProviders);

	try {
		const callDescriptors = createCallDescriptors({
			operation: "save",
			action,
			dataProviders: moduleDps.concat(dataHandlers.filter(isDataProvider)),
			activities,
			isRelevant: ({ loadingState, descriptor }) =>
				loadingState === "loaded" &&
				(dataHolderDescriptors.length === 0 ||
					dataHolderDescriptors.some(dhd => deepEqual(dhd, descriptor))),
			additionalDetails: () => {
				return {
					...payloadRest,
					updateActivityData,
					saving: {
						done(result) {
							return asyncActionCreator.done({ params: action.payload, result });
						},
						failed(error) {
							return asyncActionCreator.failed({ params: action.payload, error });
						}
					}
				};
			},
			assertAllHandled: true
		});

		yield* all(
			callDescriptors.map(({ dataProvider, config }) => call([dataProvider, "provideData"], config))
		);
	} catch (error) {
		yield* put(asyncActionCreator.failed({ params: action.payload, error: error as {} }));
	}
}
