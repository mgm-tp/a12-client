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

import { all, call, select, type SagaGenerator } from "typed-redux-saga";
import type { Action, AnyAction } from "typescript-fsa";

import { ActivityActions } from "../../../../activity/internal/actions.js";
import type { Activity } from "../../../../activity/internal/activity.js";
import { ActivitySelectors } from "../../../../activity/internal/selectors.js";
import { isDataProvider } from "../../../../data/internal/DataHandler.js";
import { ModuleExtensions } from "../../factories/moduleExtensions.js";

import type { ApplicationSaga } from "../ApplicationSaga.js";
import { ActivityUtils } from "../utils.js";

import { createCallDescriptors } from "./createCallDescriptors.js";

/** @internal */
export function deleteDataSaga(config: ApplicationSaga.Configuration): ApplicationSaga.Descriptor {
	return {
		canHandle: (_: Activity.Descriptor, action: AnyAction) =>
			ActivityActions.removeData.match(action),
		handle: (action: Action<ActivityActions.RemoveDataPayload>) => handleDeleteData(config, action)
	};
}

function* handleDeleteData(
	{ dataHandlers }: ApplicationSaga.Configuration,
	action: Action<ActivityActions.RemoveDataPayload>
): SagaGenerator<void> {
	const activities = yield* select(ActivitySelectors.activities());
	const moduleDps = yield* select(ModuleExtensions.getDataProviders);

	try {
		const callDescriptors = createCallDescriptors({
			operation: "delete",
			action,
			dataProviders: moduleDps.concat(dataHandlers.filter(isDataProvider)),
			activities,
			isRelevant: ({ loadingState }) => loadingState === "loaded"
		});

		if (callDescriptors.length > 1) {
			throw new Error(
				`Only a single delete operation is allowed for all data holders. You want to perform ${callDescriptors.length} operations instead.`
			);
		}

		yield* all(
			callDescriptors.map(({ dataProvider, config }) => call([dataProvider, "provideData"], config))
		);
	} catch (error) {
		yield* call(ActivityUtils.handleError, action.payload.activityId, "saving", error);
	}
}
