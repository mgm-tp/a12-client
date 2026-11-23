// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Lens } from "../../lenses.js";

import type { Activity } from "./activity.js";
import type { ActivityMap } from "./activityMap.js";
import { ActivitySelectors } from "./selectors.js";

const activity = (activityId: string): Lens<object, Activity | undefined> => {
	return {
		get: s => activitiesLens.get(s)[activityId],
		set: a => s => update(activityId)(a)(s)
	};
};

const activitiesLens: Lens<object, ActivityMap> = {
	get: ActivitySelectors.activities(),
	set(activities) {
		return function (s) {
			return activities !== activitiesLens.get(s)
				? {
						...s,
						activities
					}
				: s;
		};
	}
};

function update(activityId: string) {
	return (maybeA: Activity | undefined) => (maybeA ? replace(maybeA) : remove(activityId));
}

function replace(a: Activity) {
	return (s: object) =>
		a !== activity(a.id).get(s)
			? activitiesLens.set({ ...activitiesLens.get(s), [a.id]: a })(s)
			: s;
}

function remove(activityId: string) {
	return (s: object) => {
		const { [activityId]: removed, ...rest } = activitiesLens.get(s);
		return removed ? activitiesLens.set(rest)(s) : s;
	};
}

/**
 * Functions to access activities inside the Client state.
 */
export const ActivityLenses = {
	/**
	 * Lens constructor for a single activity by ID. Note that the lens is
	 * actually for Activity | undefined, because for now we don't want to
	 * introduce additional dependencies to Option(als) etc.
	 *
	 * Setting an undefined activity will remove it.
	 */
	activity,
	/**
	 * Lens for accessing and updating the whole activities map at once.
	 */
	activities: activitiesLens
};
