// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
