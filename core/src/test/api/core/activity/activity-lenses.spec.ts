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

import type { Activity } from "../../../../core/activity/index.js";
import { ActivityLenses } from "../../../../core/activity/internal/activity-lenses.js";
import { createActivity } from "../../../utils/activity.js";
import { createLensLawsTests } from "../../../utils/createLensLawsTests.js";

describe("core.activity", () => {
	describe("lenses", () => {
		describe("activities slice", () => {
			describe("empty activities slice", () => {
				const state = { activities: {} };
				const activities = state.activities;
				createLensLawsTests(ActivityLenses.activities, state, activities);
			});

			describe("single activity slice", () => {
				const state = {
					activities: {
						dummyKey: createActivity({ id: "1" })
					}
				};
				const activities = state.activities;
				createLensLawsTests(ActivityLenses.activities, state, activities);
			});
		});

		describe("single activity", () => {
			describe("non-existing activity with empty activities slice", () => {
				const state = { activities: {} };
				const activity = createActivity({ id: "1" });
				createLensLawsTests(ActivityLenses.activity(activity.id), state, activity);
			});

			describe("existing activity", () => {
				const activity = createActivity({ id: "1" });
				const anotherActivity = createActivity({ id: "2" });
				const changed = {
					...activity,
					descriptor: { changed: "true" }
				} satisfies Activity;
				const state = {
					activities: {
						[activity.id]: activity,
						[anotherActivity.id]: activity
					}
				};
				createLensLawsTests(ActivityLenses.activity(activity.id), state, changed);
			});

			describe("non-existing activity", () => {
				const activity = createActivity({ id: "1" });
				const anotherActivity = createActivity({ id: "2" });
				const state = {
					activities: {
						[anotherActivity.id]: anotherActivity
					}
				};
				createLensLawsTests(ActivityLenses.activity(activity.id), state, activity);
			});

			describe("undefined activity (to remove it)", () => {
				const activity = createActivity({ id: "1" });
				const state = {
					activities: {
						[activity.id]: activity
					}
				};
				createLensLawsTests(ActivityLenses.activity(activity.id), state, undefined);
			});
		});
	});
});
