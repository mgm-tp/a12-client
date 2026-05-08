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

import { assertCondition, assertObject } from "../../assertion.js";
import { isRecord, type Writeable } from "../../utils.js";

import type { Activity } from "./activity.js";

/**
 * This data structure holds all activities in a key/value-map. It also provides three helper functions to convert
 * or apply changes to the map.
 */
export interface ActivityMap {
	readonly [key: string]: Activity | undefined;
}

export namespace ActivityMap {
	export function isInstance(obj: unknown): obj is ActivityMap {
		return isRecord(obj);
	}

	/**
	 * Converts activities from a map to an unordered array.
	 *
	 * @param activities The activities as a key/value-map
	 * @returns Returns an unordered array of activities.
	 */
	export function toList(activities: ActivityMap): Activity[] {
		return Object.keys(activities).reduce<Activity[]>((list, key) => {
			const activity = activities[key];
			if (activity !== undefined) {
				list.push(activity);
			}
			return list;
		}, []);
	}

	/**
	 * Orders activities in a map by their tree level and activation timestamp and converts them to an
	 * array of activities.
	 * The resulting list can be used to optimize the cancellation of activities. By first cancelling
	 * activities higher in the tree, the number of necessary state changes can be reduced.
	 *
	 * Note: This method assumes a valid activities slice, i.e. all initiating activities must exist
	 * and there must be no cycles between activities.
	 *
	 * @param activities The activities as a key/value-map
	 * @returns Returns an array of activities. If the given activity map is empty, it returns an empty array.
	 */
	export function toOrderedList(activities: ActivityMap): Activity[] {
		/**
		 * 1.     Make a temporary copy of the activities map
		 * 2.
		 *    2.1 Check for activities, which have no initiatingId
		 *        OR which have an initiatingId and this one is already contained in the
		 *        sortedActivities
		 *    2.2 Add these activities id + their activation time to an array (nextTopLevelActivities)
		 *    2.3 Sort the array
		 *    2.4 Put the activities id in the sortedActivitiesList and delete them from the temporary map
		 *    2.5 If the temporary map is empty --> finish --> return sortedActivitiesList
		 *        If the temporary map is not empty --> start over at 2.1
		 */

		// list which should contain in the end all activated ids in the right order
		const sortedActivities: Activity[] = [];

		let workList = toList(activities);
		while (workList.length > 0) {
			const nextTopLevelActivities = workList.filter(
				activity =>
					activity.initiatingActivityId === undefined ||
					sortedActivities.find(a => a.id === activity.initiatingActivityId) !== undefined
			);

			// sort the new top level activities
			nextTopLevelActivities.sort((a, b) => a.activationTimestamp - b.activationTimestamp);

			// put the activities in sortedActivities and delete them from the work list
			sortedActivities.push(...nextTopLevelActivities);
			workList = workList.filter(entry => nextTopLevelActivities.every(a => a !== entry));
		}

		return sortedActivities;
	}

	/**
	 * Applies the given change to the {@link Activity} with the given ID in the map of given activities.
	 *
	 * If the activity is found, then a new map with the changed activity is returned. The changed activity's
	 * change number is also updated.
	 *
	 * If the activity is not found, the map is returned unchanged.
	 *
	 * If the change function returns undefined, it removes the activity from the map.
	 *
	 * Note that change must be pure, i.e. return a new object and not modify the given argument.
	 *
	 * @param activities The map of all activities to search
	 * @param activityId The ID of the activity to change
	 * @param change The change function to apply specific changes to the found activity. It returns an activity
	 * with the applied changes or undefined in which case the activity will be removed from the map.
	 *
	 * @returns Returns a new {@link ActivityMap} with the applied changes. If no activity is found for the given
	 * id, it returns the given map of activities.
	 */
	export function applyActivityChange(
		activities: ActivityMap,
		activityId: string,
		change: (activity: Activity) => Activity | undefined
	): ActivityMap {
		const oldActivity = activities[activityId];
		if (oldActivity === undefined) {
			return activities;
		}

		const newActivity = change(oldActivity);
		if (newActivity === oldActivity) {
			return activities;
		}

		const result: Writeable<ActivityMap> = {};
		for (const activity of ActivityMap.toList(activities)) {
			if (activity.id === oldActivity.id) {
				if (newActivity === undefined) {
					continue;
				}

				result[activity.id] = newActivity;
			} else {
				result[activity.id] = activity;
			}
		}
		return ActivityMap.checkValidity(result);
	}

	/**
	 * @internal
	 * For each activity in the state that was initiated by another, assert that:
	 * - the initiating activity exists in the state as well
	 * - the ancestor chain of activities does not contain cycles
	 *
	 * @param activities The activities as a key/value-map
	 * @returns Returns the activities map unchanged if its valid, throws an error otherwise
	 */
	export function checkValidity(activities: ActivityMap): ActivityMap {
		Object.values(activities).forEach(activity => {
			if (activity?.initiatingActivityId !== undefined) {
				assertObject(
					activities[activity.initiatingActivityId],
					`Initiating activity ${activity.initiatingActivityId} of activity ${activity.id} is missing.`
				);
				traverse(activity.id);
			}

			activity?.dataHolders.forEach(dh => {
				if (dh.datasourceActivityId) {
					assertObject(
						activities[dh.datasourceActivityId],
						`DataSource activity ${dh.datasourceActivityId} for a dataholder in activity ${activity.id} is missing.`
					);
				}
			});
		});

		function traverse(currentActivityId: string, visited: string[] = []) {
			assertCondition(
				!visited.includes(currentActivityId),
				`Activity ${currentActivityId} has a cyclic dependency: ${[
					...visited,
					currentActivityId
				].join(" -> ")}`
			);

			const initiatingActivityId = activities[currentActivityId]?.initiatingActivityId;
			if (initiatingActivityId) {
				traverse(initiatingActivityId, [...visited, currentActivityId]);
			}
		}

		return activities;
	}
}
