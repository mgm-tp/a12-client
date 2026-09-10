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

import type { Reducer } from "redux";
import type { AnyAction } from "typescript-fsa";

import { setThumbnails } from "../../a12-internal/thumbnails/action.js";
import { handleSetThumbnails } from "../../a12-internal/thumbnails/reducer.js";

import { ActivityActions } from "../actions.js";
import { Activity } from "../activity.js";
import { ActivityMap } from "../activityMap.js";

import { handleCancel } from "./handler/cancel.js";
import { handleClearError } from "./handler/clearError.js";
import { handleCommitDone, handleCommitStarted } from "./handler/commit.js";
import { handleError } from "./handler/error.js";
import { handleLoadData } from "./handler/loadData.js";
import { handleLock } from "./handler/lock.js";
import { handlePushAction } from "./handler/push.js";
import { handleResponseCancelConfirmation } from "./handler/responseCancelConfirmation.js";
import { handleSaveDone, handleSaveStarted } from "./handler/save.js";
import { handleSetCancelConfirmationRequired } from "./handler/setCancelConfirmationRequired.js";
import { handleSetCase } from "./handler/setCase.js";
import { handleSetData } from "./handler/setData.js";
import { handleSetDataByDescriptor } from "./handler/setDataByDescriptor.js";
import { handleSetDirty } from "./handler/setDirty.js";
import { handleUnlock } from "./handler/unlock.js";

/**
 * All activity related reducers. They specify how the store changes in response to actions.
 */
export namespace ActivityReducers {
	/**
	 * Can be registered as sub-reducers within the activity reducer. It enables you
	 * to change specific data for an activity.

	 */
	export interface DataReducer {
		/**
		 * Can be registered as sub-reducers within the activity reducer. It enables you
		 * to perform any kind of dataholder update, e.g.
		 * - adding dataholder(s)
		 * - changing dataholder(s)
		 * - removing dataholder(s)
		 *
		 * @param dataHolders All dataholders for the activity specified by the id in the action payload.
		 * @param action The triggering action
		 * @param defaultDataHolder The default dataholder of the activity, `undefined` if none exists
		 * to keep the existing behavior of `isDefaultDataHolder`
		 */
		reduce(
			dataHolders: Activity.DataHolder[],
			action: ActivityActions.DataReducerAction,
			defaultDataHolder?: Activity.DataHolder
		): Activity.DataHolder[];
	}

	export interface Config {
		/** Reducers to modify data of specific data holders of a specific activity
		 */
		readonly dataReducers?: ReadonlyArray<DataReducer>;
		/** A provider to resolve data holder reducers from the module system
		 */
		moduleReducers?(state: object): ReadonlyArray<DataReducer>;
	}

	/**
	 * @internal
	 *
	 * Reduces activity related actions.
	 */
	export const activities: Reducer<ActivityMap> = (
		state: ActivityMap = {},
		action: AnyAction
	): ActivityMap => {
		if (ActivityActions.push.match(action)) {
			return handlePushAction(state, action);
		} else if (ActivityActions.loadData.match(action)) {
			return handleLoadData(state, action);
		} else if (ActivityActions.setData.match(action)) {
			return handleSetData(state, action);
		} else if (ActivityActions.setDataByDescriptor.match(action)) {
			return handleSetDataByDescriptor(state, action);
		} else if (ActivityActions.setCase.match(action)) {
			return handleSetCase(state, action);
		} else if (ActivityActions.cancel.match(action)) {
			return handleCancel(state, action);
		} else if (ActivityActions.lock.match(action)) {
			return handleLock(state, action);
		} else if (ActivityActions.unlock.match(action)) {
			return handleUnlock(state, action);
		} else if (ActivityActions.error.match(action)) {
			return handleError(state, action);
		} else if (ActivityActions.clearError.match(action)) {
			return handleClearError(state, action);
		} else if (ActivityActions.commit.started.match(action)) {
			return handleCommitStarted(state, action);
		} else if (ActivityActions.commit.done.match(action)) {
			return handleCommitDone(state, action);
		} else if (ActivityActions.save.started.match(action)) {
			return handleSaveStarted(state, action);
		} else if (ActivityActions.save.done.match(action)) {
			return handleSaveDone(state, action);
		} else if (ActivityActions.setDirty.match(action)) {
			return handleSetDirty(state, action);
		} else if (ActivityActions.setCancelConfirmationRequired.match(action)) {
			return handleSetCancelConfirmationRequired(state, action);
		} else if (ActivityActions.responseCancelConfirmation.match(action)) {
			return handleResponseCancelConfirmation(state, action);
		} else if (setThumbnails.match(action)) {
			return handleSetThumbnails(state, action);
		}
		return state;
	};

	/**
	 * Reduces activity related actions.
	 *
	 * @param config For a detailed list of option have a look at {@link Config}.
	 */
	export function createActivityReducers({
		dataReducers = [],
		moduleReducers = () => []
	}: Config = {}): Reducer {
		return (state: ActivityMap = {}, action: AnyAction): ActivityMap => {
			if (ActivityActions.DataReducerAction.isInstance(action)) {
				const activityId = ActivityActions.DataReducerAction.getActivityId(action);
				const dataReducerList = [...dataReducers, ...moduleReducers(state)];

				const nextState = ActivityMap.applyActivityChange(
					state,
					activityId,
					createActivityChange(dataReducerList, action)
				);

				return nextState !== state ? nextState : activities(state, action);
			} else {
				return activities(state, action);
			}
		};
	}

	function createActivityChange(
		dataReducers: DataReducer[],
		action: ActivityActions.DataReducerAction
	): (activity: Activity) => Activity {
		return activity => {
			const dataHolders = activity.dataHolders;
			const defaultDH = Activity.findDefaultDataHolder(activity);

			const nextDataHolders = dataReducers.reduce(
				(currentDHs, { reduce }) => reduce(currentDHs, action, defaultDH),
				dataHolders
			);

			return dataHolders !== nextDataHolders
				? { ...activity, dataHolders: nextDataHolders }
				: activity;
		};
	}
}
