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
import { all, call, select, type SagaGenerator } from "typed-redux-saga";

import type { Action } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";

import { ActivityActions } from "../../../../activity/internal/actions.js";
import type { Activity } from "../../../../activity/internal/activity.js";
import { ActivitySelectors } from "../../../../activity/internal/selectors.js";
import { isDataProvider } from "../../../../data/internal/DataHandler.js";
import { ModuleExtensions } from "../../factories/moduleExtensions.js";

import type { ApplicationSaga } from "../ApplicationSaga.js";
import { ActivityUtils } from "../utils.js";

import type { CallDescriptor } from "./createCallDescriptors.js";
import { createCallDescriptors } from "./createCallDescriptors.js";

/** @internal */
export function loadActivityDataSaga(
	config: ApplicationSaga.Configuration
): ApplicationSaga.Descriptor {
	const dataHolderTracker = new DataHolderTracker();

	return {
		canHandle: (_: Activity.Descriptor, action: ReduxAction) =>
			ActivityActions.loadData.match(action),
		handle: (action: Action<ActivityActions.LoadDataPayload>) =>
			handleLoadActivityData(dataHolderTracker, config, action)
	};
}

function* handleLoadActivityData(
	dataHolderTracker: DataHolderTracker,
	{ dataHandlers, preComputeNewDocuments }: ApplicationSaga.Configuration,
	action: Action<ActivityActions.LoadDataPayload>
): SagaGenerator<void> {
	const { activityId, ...payloadRest } = action.payload;
	const activities = yield* select(ActivitySelectors.activities());
	const moduleDps = yield* select(ModuleExtensions.getDataProviders);

	let callDescriptors: CallDescriptor[] = [];

	try {
		callDescriptors = createCallDescriptors({
			operation: "load",
			action,
			dataProviders: moduleDps.concat(dataHandlers.filter(isDataProvider)),
			activities,
			isRelevant: ({ loadingState, descriptor }) =>
				loadingState === "loading" && !dataHolderTracker.has(activityId, descriptor),
			additionalDetails: () => ({
				...payloadRest,
				preComputeNewDocuments
			}),
			assertAllHandled: true
		});

		callDescriptors.forEach(({ config }) =>
			config.dataHolders.forEach(dh => dataHolderTracker.add(config.activityId, dh.descriptor))
		);

		yield* all(
			callDescriptors.map(({ dataProvider, config }) => call([dataProvider, "provideData"], config))
		);
	} catch (error) {
		yield* ActivityUtils.handleError(activityId, "loading", error);
	} finally {
		callDescriptors.forEach(({ config }) =>
			config.dataHolders.forEach(dh => dataHolderTracker.remove(config.activityId, dh.descriptor))
		);
	}
}

class DataHolderTracker {
	private state: { [activityId: string]: Activity.DataHolderDescriptor[] } = {};

	has(activityId: string, descriptor: Activity.DataHolderDescriptor): boolean {
		return this.state[activityId]?.some(x => deepEqual(x, descriptor));
	}

	add(activityId: string, descriptor: Activity.DataHolderDescriptor): void {
		this.state[activityId] ??= [];
		this.state[activityId].push(descriptor);
	}

	remove(activityId: string, descriptor: Activity.DataHolderDescriptor): void {
		if (this.state[activityId] !== undefined) {
			this.state[activityId] = this.state[activityId].filter(x => !deepEqual(x, descriptor));

			if (this.state[activityId].length === 0) {
				// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
				delete this.state[activityId];
			}
		}
	}
}
