// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepEqual, equal, notEqual } from "node:assert/strict";

import type { A12ApplicationConfig } from "../../../../core/application/internal/factories/applicationConfig.js";
import { DirtyHandlingFactories } from "../../../../extensions/dirtyHandling/index.js";
import {
	addDirtyConfirmationOnLeave,
	addDirtyHandlingSagas,
	addDirtyHandlingWrapper
} from "../../../../extensions/dirtyHandling/internal/applicationFactory.js";
import { DirtyHandlingViews } from "../../../../extensions/dirtyHandling/internal/views.js";
import { createGeneralStore } from "../../../mocks/store/store.js";
import { createActivity } from "../../../utils/activity.js";
import { toA12Config } from "../../../utils/test-utils.js";

describe("extensions.dirtyHandling.applicationFactory", () => {
	describe("addDirtyConfirmationOnLeave", () => {
		it("adds onbeforeunload that returns defined value if dirty or locked activities exist", async () => {
			const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
			const dirtyActivity = createActivity({ id: "Test", dirtyStateOfActivityDataHolder: true });

			const result = addDirtyConfirmationOnLeave(baseConfig);

			const store = createGeneralStore({ activities: [dirtyActivity] }).store;
			await result.initialActions?.(store);
			notEqual(window.onbeforeunload?.({} as BeforeUnloadEvent), undefined);
		});

		it("adds onbeforeunload that returns undefined if no dirty or locked activities exist", async () => {
			const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
			const activity = createActivity({ id: "Test" });

			const result = addDirtyConfirmationOnLeave(baseConfig);

			const store = createGeneralStore({ activities: [activity] }).store;
			await result.initialActions?.(store);
			equal(window.onbeforeunload?.({} as BeforeUnloadEvent), undefined);
		});
	});

	it("addDirtyHandlingWrapper", () => {
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });

		const result = addDirtyHandlingWrapper(baseConfig);

		equal(result.config.WrapperComponent, DirtyHandlingViews.VetoDialog);
	});

	it("addDirtyHandlingSagas", () => {
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });

		const result = addDirtyHandlingSagas(baseConfig);

		deepEqual(
			result.config.overridePlatformSagas?.length,
			DirtyHandlingFactories.createSagas().length
		);
	});
});
