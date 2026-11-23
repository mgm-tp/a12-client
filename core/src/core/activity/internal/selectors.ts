// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import deepEqual from "fast-deep-equal";

import type { DynamicMatchCondition } from "../../configurationNG/index.js";
import type { Selector } from "../../store/index.js";
import { createSliceSelector } from "../../store/internal/selectors.js";

import { Activity } from "./activity.js";
import { ActivityMap } from "./activityMap.js";
import { findDependentActivities, findLatestActivity, findTopLevelActivities } from "./utils.js";

/**
 * All activity related selectors.
 */
export namespace ActivitySelectors {
	/**
	 * Selects all activities from the store.
	 */
	export function activities(): Selector<ActivityMap> {
		return createSliceSelector("activities", ActivityMap.isInstance);
	}

	/**
	 * Selects all activities from the store that match the given {@link Activity.Descriptor}.
	 */
	export function activitiesByDescriptor(descriptor: Activity.Descriptor): Selector<Activity[]> {
		return state =>
			ActivityMap.toList(activities()(state)).filter(activity =>
				deepEqual(activity.descriptor, descriptor)
			);
	}

	/**
	 * Selects all activities from the store that match the given match condition.
	 */
	export function activitiesByMatchCondition(matches: DynamicMatchCondition): Selector<Activity[]> {
		return state =>
			ActivityMap.toList(activities()(state)).filter(activity => matches(activity.descriptor));
	}

	/**
	 * Selects the activity from the store that matches the given activityId. If no activity matches, it returns
	 * undefined.
	 */
	export function activityById(activityId: string): Selector<Activity | undefined> {
		return state => activities()(state)[activityId];
	}

	/**
	 * Selects all prior activities of a given {@link Activity} from the store.
	 */
	export function initiatingPath(activityId: string): Selector<Activity[]> {
		return state => {
			const path: Activity[] = [];

			let activity = activityById(activityId)(state);
			while (activity?.initiatingActivityId !== undefined) {
				activity = activityById(activity.initiatingActivityId)(state);
				if (activity !== undefined) {
					path.unshift(activity);
				}
			}

			return path;
		};
	}

	/**
	 * Selects the activity from the store that matches two conditions: it has an instance in its
	 * {@link Activity.Descriptor} and the given activity is its parent activity. Otherwise it returns undefined.
	 */
	export function childActivityWithInstance(
		parentActivityId: string
	): Selector<Activity | undefined> {
		return state =>
			ActivityMap.toList(activities()(state)).find(
				activity =>
					activity.initiatingActivityId === parentActivityId &&
					activity.descriptor.instance !== undefined
			);
	}

	/**
	 * Selects the activity from the store that matches two conditions: it has the given instance in its
	 * {@link Activity.Descriptor} and the given activity is its parent activity. Otherwise it returns undefined.
	 */
	export function childActivityByInstanceId(
		parentActivity: Activity,
		instance: string
	): Selector<Activity | undefined> {
		return state =>
			ActivityMap.toList(activities()(state)).find(
				activity =>
					activity.initiatingActivityId === parentActivity.id &&
					activity.descriptor.instance === instance
			);
	}

	/**
	 * Selects the activity from the store that has the latest activationTimestamp. If the {@link ActivityMap} in
	 * the store is empty, it returns undefined.
	 */
	export function latestActivity(): Selector<Activity | undefined> {
		return state => findLatestActivity(activities()(state));
	}

	/**
	 * Selects details about the loading state for a given activity. It contains the loading state and an optional
	 * error of type {@link Activity.Error}, if an error occurs.
	 */
	export function loadingState(activity: Activity): Activity.LoadingState.Details {
		const { dataHolders, descriptor } = activity;

		const activityDataHolder = dataHolders.find(Activity.DataHolder.hasDescriptor(descriptor));
		if (activityDataHolder === undefined) {
			// if no activity data holder could be found, we return the default loading state
			return {
				state: "missing"
			};
		}
		const state = activityDataHolder.loadingState;
		return {
			state,
			error: state === "error" ? Activity.findDefaultDataHolder(activity)?.error : undefined
		};
	}

	/**
	 * Selects details about the saving state for a given activity. It contains the saving state and an optional
	 * error of type {@link Activity.Error}, if an error occurs.
	 */
	export function savingState(activity: Activity): Activity.SavingState.Details {
		const { dataHolders, descriptor } = activity;

		const activityDataHolder = dataHolders.find(Activity.DataHolder.hasDescriptor(descriptor));
		if (activityDataHolder === undefined) {
			// if no activity data holder could be found, we return the default saving state
			return {
				state: "not_saved"
			};
		}
		const state = activityDataHolder.savingState;
		return {
			state,
			error: state === "error" ? Activity.findDefaultDataHolder(activity)?.error : undefined
		};
	}

	/**
	 * Selects the {@link Activity.DataHolder.data} from the activity data holder
	 * @param activityId The id of the activity from which the data is selected from the
	 * activity data holder
	 */
	export function data(activityId: string): Selector<object | undefined> {
		const activitySelector = activityById(activityId);
		return state => Activity.findDefaultDataHolder(activitySelector(state))?.data;
	}

	/**
	 * Selects the {@link Activity.DataHolder.dirty} from the activity data holder
	 * @param activityId The id of the activity from which the dirty is selected from the
	 * activity data holder
	 */
	export function dirty(activityId: string): Selector<boolean> {
		const activitySelector = activityById(activityId);
		return state => activitySelector(state)?.dataHolders.some(a => a.dirty) === true;
	}

	/**
	 * Selects the {@link Activity.DataHolder.busy} from the activity data holder
	 * @param activityId The id of the activity from which the busy is selected from the
	 * activity data holder
	 */
	export function busy(activityId: string): Selector<boolean | undefined> {
		const activitySelector = activityById(activityId);
		return state => Activity.findDefaultDataHolder(activitySelector(state))?.busy;
	}

	/**
	 * Selects the {@link Activity.DataHolder.error} from the activity data holder
	 * @param activityId The id of the activity from which the error is selected from the
	 * activity data holder
	 */
	export function error(activityId: string): Selector<Activity.Error | undefined> {
		const activitySelector = activityById(activityId);
		return state => Activity.findDefaultDataHolder(activitySelector(state))?.error;
	}

	/**
	 * Selects the {@link Activity.DataHolder.datasourceActivityId} from the activity data holder
	 * @param activityId The id of the activity from which the datasourceActivityId is selected from the
	 * activity data holder
	 */
	export function datasourceActivityId(activityId: string): Selector<string | undefined> {
		const activitySelector = activityById(activityId);
		return state => Activity.findDefaultDataHolder(activitySelector(state))?.datasourceActivityId;
	}

	/**
	 * Selects all top level activities from the store, i.e. all activities that are not initiated by another
	 * activity and do not receive their data from another activity. It always returns a new {@link ActivityMap}.
	 */
	export function topLevelActivities(): Selector<ActivityMap> {
		return state => findTopLevelActivities(activities()(state));
	}

	/**
	 * Selects all dirty or locked activities from the store.
	 * An activity is seen as dirty if any of its data holder is dirty.
	 */
	export function allDirtyOrLockedActivities(activity?: Activity): Selector<Activity[]> {
		return state => {
			const subTree = activity
				? [
						activity,
						...ActivityMap.toList(findDependentActivities(activities()(state), activity.id))
					]
				: ActivityMap.toList(activities()(state));

			return subTree.filter(a => ActivitySelectors.dirty(a.id)(state) || a.lock !== undefined);
		};
	}

	/**
	 * Selects an activity for which a cancel confirmation is required
	 */
	export function activityByCancelConfirmationRequired(): Selector<Activity | undefined> {
		return state => {
			const listActivities = ActivityMap.toList(activities()(state));
			return listActivities.find(a => a.cancelConfirmationRequired === true);
		};
	}

	/**
	 * Selects an data holder for the given activityId and data holder descriptor.
	 */
	export function dataHolderByDescriptor(
		activityId: string,
		descriptor: Activity.DataHolderDescriptor
	): Selector<Activity.DataHolder | undefined> {
		return state => {
			const activity = activityById(activityId)(state);
			const allDataHolders = activity?.dataHolders ?? [];
			return allDataHolders.find(Activity.DataHolder.hasDescriptor(descriptor));
		};
	}

	/**
	 * Selects the {@link Activity.LoadingState} for the specified activity, if it exists.
	 */
	export function loadingStateById(activityId: string): Selector<Activity.LoadingState> {
		const activitySelector = activityById(activityId);
		return state => {
			const { loadingState } = Activity.findDefaultDataHolder(activitySelector(state)) ?? {};

			// if no activity data holder could be found, we return the default loading state
			return loadingState ?? "missing";
		};
	}

	/**
	 * Selects the {@link Activity.SavingState} for the specified activity, if it exists.
	 */
	export function savingStateById(activityId: string): Selector<Activity.SavingState> {
		const activitySelector = activityById(activityId);
		return state => {
			const { savingState } = Activity.findDefaultDataHolder(activitySelector(state)) ?? {};

			// if no activity data holder could be found, we return the default saving state
			return savingState ?? "not_saved";
		};
	}

	/**
	 * For the given `activityId`, selects the result of given `lens` when the referenced activity exists, `undefined` otherwise.
	 */
	export function activityPropById<T>(
		activityId: string,
		lens: (activity: Activity) => T
	): Selector<T | undefined> {
		const activitySelector = activityById(activityId);
		return state => {
			const activity = activitySelector(state);
			return activity ? lens(activity) : undefined;
		};
	}
}
