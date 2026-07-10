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

import type { Action } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";
import { actionCreatorFactory } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";

import { isRecord } from "../../utils.js";

import type { Activity } from "./activity.js";

const factory = actionCreatorFactory("Activity");

/**
 * These actions are objects that send data about the activities
 * to the Redux store or are used together with redux sagas to handle the flow of
 * activity related data.
 */
export namespace ActivityActions {
	/** Payload for Activity-bound action. Contains the ID of the Activity */
	export interface ActivityActionPayload {
		readonly activityId: string;
	}

	export namespace ActivityActionPayload {
		/** Check if the given object is an action payload with activityId. */
		export function isInstance(o: unknown): o is ActivityActionPayload {
			return isRecord(o) && o.activityId !== undefined;
		}
	}

	/** Payload for Activity-bound async actions. */
	export interface AsyncActivityActionPayload {
		readonly params: ActivityActionPayload;
	}

	export namespace AsyncActivityActionPayload {
		export function isInstance(o: unknown): o is AsyncActivityActionPayload {
			return isRecord(o) && isRecord(o.params) && o.params.activityId !== undefined;
		}
	}

	/**
	 * Payload of Activity Data Reducer actions.
	 *
	 * Must define activityId either directly in payload or in params of
	 * done/error Async Action Creator actions.
	 */
	export type DataReducerActionPayload = ActivityActionPayload | AsyncActivityActionPayload;

	/**
	 * Actions for Activity Data Reducers. Contains DataReducerActionPayload.
	 */
	export type DataReducerAction = Action<DataReducerActionPayload>;

	export namespace DataReducerAction {
		function hasObjectPayload(a: unknown): a is Action<object> {
			return isRecord(a) && a.payload !== null && typeof a.payload === "object";
		}

		export function isInstance(a: unknown): a is DataReducerAction {
			return (
				hasObjectPayload(a) &&
				(ActivityActionPayload.isInstance(a.payload) ||
					AsyncActivityActionPayload.isInstance(a.payload))
			);
		}

		/**
		 * Convenience function to retrieve activityId from either
		 * payload or in params of
		 * done/error Async Action Creator actions.
		 */
		export function getActivityId(a: DataReducerAction): string {
			return ActivityActionPayload.isInstance(a.payload)
				? a.payload.activityId
				: a.payload.params.activityId;
		}
	}

	/**
	 * Action to cancel an activity and all its dependent activities.
	 */
	export const cancel = factory<CancelPayload>("CANCEL");

	export interface CancelPayload extends ActivityActionPayload {
		/**
		 * New activity that replaces the cancelled activity.
		 */
		readonly replacementActivity?: Activity;
	}

	/**
	 * Action to request a cancel for an activity
	 */
	export const cancelRequested = factory<CancelRequestedPayload>("CANCEL_REQUESTED");

	export interface CancelRequestedPayload {
		/**
		 * List of activities to cancel
		 */
		readonly activityIds: string[];

		/**
		 * New activity that replaces the cancelled activity.
		 *
		 * If this is provided and the number of `activityIds` is not exactly
		 * one then an error will be thrown in the sagas.
		 */
		readonly replacementActivity?: Activity;
	}

	/**
	 * Action to request a cancel for an activity with a response
	 */
	export const responseCancelRequested = factory<ResponseCancelRequestedPayload>(
		"RESPONSE_CANCEL_REQUESTED"
	);

	export interface ResponseCancelRequestedPayload {
		/**
		 * Identifies if all activities, from
		 * the cancelRequested action were cancelled
		 */
		readonly cancelled: boolean;
	}

	/**
	 * Action to unset the error property of an activity.
	 */
	export const clearError = factory<ActivityActionPayload>("CLEAR_ERROR");

	/**
	 * Action to save the data of an activity.
	 */
	export const save = factory.async<SaveDataPayload, SaveResult>("SAVE");

	export interface SaveDataPayload extends ActivityActionPayload {
		/**
		 * Specifies for which dataholders the data saving will be triggered
		 */
		readonly dataHolderDescriptors?: Activity.DataHolderDescriptor[];
	}

	export interface SaveResult {
		/**
		 * Updated instance identifier for descriptor.
		 */
		readonly instance?: string;
	}

	/**
	 * Action to commit an activity.
	 */
	export const commit = factory.async<CommitPayload, {}>("COMMIT");

	export interface CommitPayload extends ActivityActionPayload {
		/**
		 * New activity that replaces the committed activity.
		 */
		readonly replacementActivity?: Activity;

		/**
		 * Specifies for which dataholders the data saving will be triggered
		 */
		readonly dataHolderDescriptors?: Activity.DataHolderDescriptor[];
	}

	/** @internal */
	export let activityIdCounter = 0;

	/**
	 * Factory function for creating a push action, that will trigger the creation
	 * of a new activity. `data`, `loadingState`, and `slices` are used for the
	 * creation of the default data holder.
	 *
	 * @param payload An object to configure the new activity
	 *
	 * @returns a {@link push} action.
	 */
	export function create({
		activityId = `${++activityIdCounter}`,
		activityDescriptor,
		initiatingActivityId,
		data,
		loadingState,
		slices = {}
	}: CreatePayload): Action<PushPayload> {
		const nextLoadingState = loadingState ?? (data !== undefined ? "loaded" : "missing");

		const dataHolders: Activity.DataHolder[] = [
			{
				data: data ?? {},
				descriptor: activityDescriptor,
				dirty: false,
				loadingState: nextLoadingState,
				savingState: "not_saved",
				slices
			}
		];

		const activity: Activity = {
			id: activityId,
			activationTimestamp: Date.now(),
			descriptor: activityDescriptor,
			initiatingActivityId,
			dataHolders
		};

		return push({ activity });
	}

	export interface CreatePayload {
		/** Unique identifier for the new activity.
		 *
		 * If not provided, a numeric id will be generated.
		 * Please do not use numeric ids yourself.
		 */
		readonly activityId?: string;

		/**
		 * Reference to a parent activity for the new activity
		 */
		readonly initiatingActivityId?: string;

		/**
		 * The activity descriptor for the new activity
		 */
		readonly activityDescriptor: Activity.Descriptor;

		/**
		 * Data for the new activity.
		 *
		 * This can be used to create the activity with its data already initialized,
		 * e.g. when the activity's initial data is already known at the time of creation.
		 *
		 * If this is provided in the payload, the client sagas normally responsible for loading the data
		 * with DataLoaders or DataEditors will not be triggered. Only model loading will be triggered.
		 */
		readonly data?: object;

		/**
		 * Loading state or the new activity. Accepted value is "without" if
		 * the data property in this activity is not relevant.
		 *
		 * Otherwise the loading state is set to "loaded" or "missing" depending
		 * on the data property.
		 */
		readonly loadingState?: Activity.LoadingState;

		/**
		 * Additional slices for the default data holder.
		 */
		readonly slices?: Activity.DataHolder["slices"];
	}

	/**
	 * Action to report a `"loading"` or `"saving"` error for the activity. The error
	 * is stored in the error property of the default data holder of the activity.
	 *
	 * If a `"loading"` or `"saving"` error should be set to a non-default data
	 * holder, then a custom action and custom data reducers is required.
	 *
	 * See {@link Activity.DataHolder.error}
	 */
	export const error = factory<ErrorPayload>("ERROR");

	export interface ErrorPayload<T = unknown> extends ActivityActionPayload {
		/**
		 * It tracks in which operation the error occurred
		 */
		readonly operationType: "loading" | "saving";

		/**
		 * The actual error that occurred and is set for the activity
		 */
		readonly error: T;
	}

	/**
	 * Action to trigger the loading of data for an activity. In addition, it changes the
	 * loading state to "loading" and sets the busy property to true.
	 */
	export const loadData = factory<LoadDataPayload>("LOAD_DATA");

	export interface LoadDataPayload extends ActivityActionPayload {
		readonly missingOnly?: boolean;

		/**
		 * Specifies for which dataholders the data loading will be triggered
		 */
		readonly dataHolderDescriptors?: Activity.DataHolderDescriptor[];
	}

	/**
	 * Action to set the lock property for the activity.
	 */
	export const lock = factory<LockPayload>("LOCK");

	export interface LockPayload extends ActivityActionPayload {
		/**
		 * An identifier of the lock
		 */
		readonly id: string;

		/**
		 * String representing the subject that requests a lock for the activity
		 */
		readonly owner: string;

		/**
		 * Object with additional information about the lock
		 */
		readonly details: {};
	}

	/**
	 * Action to push a given activity from the action's payload to the activity store slice.
	 *
	 * Note: The Client registers by default the normalizePushActivity middleware,
	 * that makes sure that, if the pushed activity has no case and
	 * the scene that matches this activity has a default case, this activity will contain this default case.
	 */
	export const push = factory<PushPayload>("PUSH");

	export interface PushPayload {
		/**
		 * The activity that gets pushed to the store
		 */
		readonly activity: Activity;
	}

	/**
	 * Action to trigger a reload of data for ui engines.
	 */
	export const reloadData = factory<ActivityActionPayload>("RELOAD");

	/**
	 * Action to trigger a removal of data.
	 */
	export const removeData = factory<RemoveDataPayload>("REMOVE_DATA");

	export interface RemoveDataPayload extends ActivityActionPayload {
		/**
		 * Id of instance which should be remove.
		 */
		readonly instanceId: string;
	}

	/**
	 * Action to store the given data into the activity. It also changes the loading state
	 * of an activity to "loaded" and sets the busy property to false.
	 *
	 * If there is asynchronous data loading for the target activity in progress e.g. after create,
	 * while this action is dispatched, it is possible that the set data gets overwritten later.
	 * Therefore make sure to wait with dispatching this action until the asynchronous execution has finished.
	 */
	export const setData = factory<SetDataPayload>("SET_DATA");

	export interface SetDataPayload extends ActivityActionPayload {
		/**
		 * Object holding the data that gets set into the activity
		 */
		readonly data: object;

		/**
		 * Reference to the activity that acts as the source of the new data
		 */
		readonly datasourceActivityId?: string;

		/**
		 * A flag indicating the new dirty state of the default data holder
		 */
		readonly dirty?: boolean;
	}

	/**
	 * Action to store the given data into the activity. It also changes the loading state
	 * of an activity to "loaded" and sets the busy property to false.
	 *
	 * If there is asynchronous data loading for the target activity in progress e.g. after create,
	 * while this action is dispatched, it is possible that the set data gets overwritten later.
	 * Therefore make sure to wait with dispatching this action until the asynchronous execution has finished.
	 */
	export const setDataByDescriptor = factory<SetDataByDescriptorPayload>("SET_DATA_BY_DESCRIPTOR");

	export interface SetDataByDescriptorPayload extends ActivityActionPayload {
		/**
		 * Descriptor for the activity's data holder that gets new data
		 */
		readonly descriptor: Activity.DataHolderDescriptor;

		/**
		 * Object holding the data that gets set into the activity
		 */
		readonly data: object;
	}

	/**
	 * Action to set the dirty property of the activity.
	 */
	export const setDirty = factory<SetDirtyPayload>("SET_DIRTY");

	export interface SetDirtyPayload extends ActivityActionPayload {
		/**
		 * Flag indicating the dirty state of the activity
		 */
		readonly dirty: boolean;
	}

	/**
	 * Action to set the case property of the activity
	 */
	export const setCase = factory<SetCasePayload>("SET_CASE");

	export interface SetCasePayload extends ActivityActionPayload {
		/**
		 * The reference to a case
		 */
		readonly case: string | undefined;
	}

	/**
	 * Action to set cancelConfirmationRequired for the activity. A cancellation of the
	 * activity then requires that a {@link responseCancelConfirmation} action is dispatched.
	 */
	export const setCancelConfirmationRequired = factory<SetCancelConfirmationRequiredPayload>(
		"SET_CANCEL_CONFIRMATION_REQUIRED"
	);

	export interface SetCancelConfirmationRequiredPayload extends ActivityActionPayload {
		/**
		 * Tracks if a cancel confirmation is required for the activity
		 */
		readonly cancelConfirmationRequired: boolean;
	}

	/**
	 * Action to respond if an activity contains cancelConformationRequired=true
	 */
	export const responseCancelConfirmation = factory<ResponseCancelConfirmationPayload>(
		"RESPONSE_CANCEL_CONFIRMATION"
	);

	export interface ResponseCancelConfirmationPayload extends ActivityActionPayload {
		/**
		 * Tracks if there was a veto during the confirmation of the cancel
		 */
		readonly veto: boolean;
	}

	/**
	 * Action to unset the lock property for the activity.
	 */
	export const unlock = factory<UnlockPayload>("UNLOCK");

	export interface UnlockPayload extends ActivityActionPayload {
		/**
		 * Identifier for the lock which should get unlocked.
		 */
		readonly lockId: string;
	}
}
