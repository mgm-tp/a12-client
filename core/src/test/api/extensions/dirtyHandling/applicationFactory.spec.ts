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
