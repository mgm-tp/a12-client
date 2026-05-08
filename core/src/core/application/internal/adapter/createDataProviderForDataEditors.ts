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

import { call, put, select } from "typed-redux-saga";

import { ActivityActions } from "../../../activity/internal/actions.js";
import { Activity } from "../../../activity/internal/activity.js";
import { ActivityMap } from "../../../activity/internal/activityMap.js";
import { ActivitySelectors } from "../../../activity/internal/selectors.js";
import { assertUnreachable } from "../../../assertion.js";
import type { DataEditor } from "../../../data/internal/DataEditor.js";
import type {
	DataHandlersLoadResult,
	DataHandlersSaveResult
} from "../../../data/internal/DataHandler.js";
import { DataUtils } from "../../../data/internal/DataHandler.js";
import type { DataProvider } from "../../../data/internal/DataProvider.js";
import { ModelSagas } from "../../../model/internal/sagas.js";

/** @internal */
export function createDataProviderForDataEditors(dataEditors: DataEditor[]): DataProvider {
	function readFromParent(activity: Activity, allActivities: ActivityMap): DataHandlersLoadResult {
		const result = DataUtils.findMatchingDataEditorForActivity(
			activity,
			allActivities,
			dataEditors
		);

		const data = result.dataEditor.read(result.parentActivity, activity.descriptor);

		return {
			data,
			datasourceActivityId: result.parentActivity.id
		};
	}

	function writeToParent(activity: Activity, allActivities: ActivityMap): DataHandlersSaveResult {
		const result = DataUtils.findMatchingDataEditorForActivity(
			activity,
			allActivities,
			dataEditors
		);

		const data = Activity.findDefaultDataHolder(activity)?.data;
		if (data === undefined) {
			throw new Error("Cannot handle empty data");
		}

		return {
			data: result.dataEditor.write(result.parentActivity, activity.descriptor, data),
			datasourceActivityId: result.parentActivity.id
		};
	}

	return {
		// FIXME: is there a way to find the name of the matching data editor?
		name: "DataEditor",
		canHandle({ operation, dataHolder, activities = {} }) {
			switch (operation) {
				case "load":
				case "save": {
					const listAllActivities = ActivityMap.toList(activities);
					const foundMatchingDataEditor = listAllActivities.some(
						parentActivity =>
							DataUtils.findMatchingDataEditor(
								dataEditors,
								parentActivity.descriptor,
								dataHolder.descriptor
							) !== undefined
					);
					return foundMatchingDataEditor;
				}
				case "delete":
					// this is done by purpose. In previous version we did not
					// ask any data editor for delete operations
					return false;
				default:
					throw new Error(`Method ${operation} is not supported.`);
			}
		},
		*provideData(config) {
			const activity = yield* select(ActivitySelectors.activityById(config.activityId));

			if (activity === undefined) {
				throw new Error(`No activity found for id ${config.activityId}.`);
			}

			const allActivities = yield* select(ActivitySelectors.activities());

			yield* call(ModelSagas.waitForModelsLoaded, config.activityId);

			switch (config.operation) {
				case "load":
					{
						const { data, datasourceActivityId } = yield* call(
							readFromParent,
							activity,
							allActivities
						);
						yield* put(
							ActivityActions.setData({
								activityId: config.activityId,
								data,
								datasourceActivityId
							})
						);
					}
					break;
				case "save":
					{
						const { saving } = config.details;

						const { data, datasourceActivityId } = yield* call(
							writeToParent,
							activity,
							allActivities
						);

						let instance: string | undefined;

						if (data !== undefined) {
							if (datasourceActivityId !== undefined) {
								yield* put(
									ActivityActions.setData({
										activityId: datasourceActivityId,
										data,
										dirty: true
									})
								);
							}

							if ("document" in data && Activity.Data.Document.isInstance(data.document)) {
								instance = data.document.id;
							}
						}

						yield* put(saving.done(instance !== undefined ? { instance } : {}));
					}
					break;
				case "delete":
					throw new Error(`Data editors do not support delete operations.`);
				default:
					assertUnreachable(config);
			}
		}
	};
}
