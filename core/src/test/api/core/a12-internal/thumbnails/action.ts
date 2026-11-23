// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual } from "node:assert/strict";

import { setThumbnails } from "../../../../../core/activity/a12-internal/thumbnails/action.js";
import { THUMBNAIL_SLICE } from "../../../../../core/activity/a12-internal/thumbnails/slice.js";
import { ActivityReducers } from "../../../../../core/activity/index.js";
import { createActivity } from "../../../../utils/activity.js";
import { setupState } from "../../activity/reducer-test-utils.js";
import { setupActivityMap } from "../../activity/util.js";

export function executeTestForSetThumbnails(): void {
	describe("given a setThumbnails action", () => {
		it(`returns a new ActivityMap, in which a thumbnail slice of the defaultDH of the activity with the id from the action payload
			is newly created if it didn't exist yet`, () => {
			const initialActivity = createActivity({
				id: "activityWithoutSlices"
			});

			const action = setThumbnails({
				activityId: "activityWithoutSlices",
				thumbnails: {
					a1: "url1",
					a2: "url2"
				}
			});

			const state = setupState([initialActivity]);
			const updatedActivityMap = ActivityReducers.activities(state, action);

			const expectedActivityMap = setupActivityMap([
				createActivity({
					id: "activityWithoutSlices",
					activityDataHolder: {
						slices: { [THUMBNAIL_SLICE]: { a1: "url1", a2: "url2" } }
					}
				})
			]);
			deepStrictEqual(updatedActivityMap, expectedActivityMap);
		});

		describe("with an object containing a string->string mapping", () => {
			it(`returns a new ActivityMap, in which the thumbnail slice of the defaultDH of the activity with the id from the action payload
				was updated with all given thumbnail urls`, () => {
				const initialActivity = createActivity({
					id: "activityWithSlice",
					activityDataHolder: { slices: { [THUMBNAIL_SLICE]: { a0: "url0" } } }
				});

				const action = setThumbnails({
					activityId: "activityWithSlice",
					thumbnails: {
						a1: "url1",
						a2: "url2"
					}
				});

				const state = setupState([initialActivity]);
				const updatedActivityMap = ActivityReducers.activities(state, action);

				const expectedActivityMap = setupActivityMap([
					createActivity({
						id: "activityWithSlice",
						activityDataHolder: {
							slices: { [THUMBNAIL_SLICE]: { a0: "url0", a1: "url1", a2: "url2" } }
						}
					})
				]);
				deepStrictEqual(updatedActivityMap, expectedActivityMap);
			});
		});
	});
}
