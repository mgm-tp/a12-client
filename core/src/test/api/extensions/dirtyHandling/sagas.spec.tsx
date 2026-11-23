// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { notStrictEqual, strictEqual } from "node:assert/strict";

import type { Activity } from "../../../../core/activity/index.js";
import { ActivityActions, ActivitySelectors } from "../../../../core/activity/index.js";
import { ModuleTestExtensions } from "../../../../core/application/index.js";
import { createApplicationSetup } from "../../../utils/test-utils.js";

describe("extensions.dirtyHandling", () => {
	after(ModuleTestExtensions.reset);

	describe("Sagas", () => {
		describe("Given an activity in the store", () => {
			const activityId = "1";
			const activityDescriptor: Activity.Descriptor = {
				section: "DataHandling",
				feature: "CRUD",
				model: "CRUDExample"
			};

			describe("When the activity is dirty and ActivityActions.cancelRequested action is dispatched", () => {
				it("cancels the activity and removes it from the store", async () => {
					const { store, waitFor } = createApplicationSetup({ withDirtyHandling: true });

					store.dispatch(ActivityActions.create({ activityId, activityDescriptor }));

					await waitFor(state => {
						notStrictEqual(ActivitySelectors.activityById(activityId)(state), undefined);
					});

					store.dispatch(ActivityActions.cancelRequested({ activityIds: [activityId] }));

					await waitFor(state => {
						strictEqual(ActivitySelectors.activityById(activityId)(state), undefined);
					});
				});
			});
		});
	});
});
