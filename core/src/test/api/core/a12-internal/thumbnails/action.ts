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
