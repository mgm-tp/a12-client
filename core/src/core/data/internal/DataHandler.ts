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

import type { Activity } from "../../activity/internal/activity.js";
import { ActivityMap } from "../../activity/internal/activityMap.js";
import { ActivitySelectors } from "../../activity/internal/selectors.js";
import { ApplicationModel } from "../../model/internal/ApplicationModel.js";

import type { DataEditor } from "./DataEditor.js";
import type { DataLoader } from "./DataLoader.js";
import type { DataProvider } from "./DataProvider.js";

/**
 * A data-handling structure available in a Client based application.
 * Can be either a :
 * - {@link DataLoader}
 * - {@link DataEditor}
 * - {@link DataProvider}
 *
 * It is typically created and used where the application is set up.
 */
export type DataHandler = DataLoader | DataEditor | DataProvider;

export function isDataLoader(dataHandler: DataHandler): dataHandler is DataLoader {
	return "canHandle" in dataHandler && "load" in dataHandler;
}

export function isDataEditor(dataHandler: DataHandler): dataHandler is DataEditor {
	return !("canHandle" in dataHandler) && "read" in dataHandler && "write" in dataHandler;
}

export function isDataProvider(dataHandler: DataHandler): dataHandler is DataProvider {
	return "canHandle" in dataHandler && "provideData" in dataHandler;
}

/** @internal */
export interface DataHandlersSearchResult {
	dataEditor: DataEditor;
	parentActivity: Activity;
}

/** @internal */
export interface DataHandlersLoadResult {
	data: object;
	datasourceActivityId?: string;
}

/** @internal */
export interface DataHandlersSaveResult {
	data?: object;
	datasourceActivityId?: string;
}

/** @internal */
export const DataUtils = {
	findMatchingDataEditorForActivity(
		activity: Activity,
		allActivities: ActivityMap,
		dataEditors: DataEditor[]
	): DataHandlersSearchResult {
		const parentActivities = DataUtils.getInitiatingActivities(
			ActivityMap.toList(allActivities),
			activity
		);
		for (const parentActivity of parentActivities) {
			const dataEditor = DataUtils.findMatchingDataEditor(
				dataEditors,
				parentActivity.descriptor,
				activity.descriptor
			);
			if (dataEditor !== undefined) {
				const loadingState = ActivitySelectors.loadingState(parentActivity);
				if (loadingState.state === "loaded") {
					return {
						parentActivity,
						dataEditor
					};
				} else {
					throw new Error(`Cannot handle parent loadingState "${loadingState.state}"`);
				}
			}
		}

		throw new Error(
			`Could not find suitable data editor for activity ${JSON.stringify(activity.descriptor)}.`
		);
	},
	findMatchingDataEditor(
		dataEditors: DataEditor[],
		sourceActivityDescriptor: Activity.Descriptor,
		childActivityDescriptor: Activity.Descriptor
	): DataEditor | undefined {
		return dataEditors.find(
			editor =>
				editor.meta.childMatchConditions.every(state =>
					ApplicationModel.MatchCondition.evaluate(state, childActivityDescriptor)
				) &&
				editor.meta.parentMatchConditions.every(state =>
					ApplicationModel.MatchCondition.evaluate(state, sourceActivityDescriptor)
				)
		);
	},
	getInitiatingActivities(allActivities: Activity[], currentActivity: Activity): Activity[] {
		/**
		 * Get all ancestors of an activity, bottom to top.
		 * The first entry in the result array is the direct parent.
		 */
		const result: Activity[] = [];
		let initiatingActivityId: string | undefined = currentActivity.initiatingActivityId;

		while (initiatingActivityId !== undefined) {
			const parent = allActivities.find(a => a.id === initiatingActivityId);
			if (parent !== undefined) {
				result.push(parent);
				initiatingActivityId = parent.initiatingActivityId;
			}
		}

		return result;
	}
};
