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
