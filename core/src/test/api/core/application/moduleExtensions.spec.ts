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

import { strictEqual } from "node:assert/strict";

import type { Module } from "../../../../core/application/index.js";
import { ModuleTestExtensions } from "../../../../core/application/index.js";
import { ModuleExtensions } from "../../../../core/application/internal/factories/moduleExtensions.js";
import type { ModuleRegistry } from "../../../../core/application/internal/factories/moduleRegistry.js";
import { ModuleRegistryProvider } from "../../../../core/application/internal/factories/moduleRegistryProvider.js";
import { MockDataEditor } from "../../../mocks/application/dataEditorMock.js";
import { createActivity, createDataHolder } from "../../../utils/activity.js";

function registry(): ModuleRegistry {
	return ModuleRegistryProvider.getInstance();
}

describe("core.application", () => {
	/**
	 * Not all functions of ModuleExtensions are tested here.
	 * Some are only required when initializing the application setup.
	 * Thus, they are tested separately in modularization.spec.ts
	 */
	describe("ModuleExtensions", () => {
		describe("getDataProviders", () => {
			describe("Given two modules with DataEditors", () => {
				let module1: Module;
				let module2: Module;

				before(() => {
					ModuleTestExtensions.reset();

					const dataEditor1 = new MockDataEditor("1");
					const dataEditor2 = new MockDataEditor("2");

					module1 = { id: "module1", dataEditors: [dataEditor1] };
					module2 = { id: "module2", dataEditors: [dataEditor2] };

					registry().addModule(module1);
					registry().addModule(module2);
				});

				after(() => {
					registry().removeModule(module1);
					registry().removeModule(module2);
				});

				it("returns a DataProvider for the given DataEditors", () => {
					const module1ParentActivity = createActivity({
						id: "A",
						descriptor: { model: "BookAuthor1", instance: "BookAuthor1/1" }
					});
					const module1ChildActivity = createActivity({
						id: "B",
						descriptor: { model: "Book1", instance: "Book1/1" },
						initiatingActivityId: "A"
					});

					const module2ParentActivity = createActivity({
						id: "C",
						descriptor: { model: "BookAuthor2", instance: "BookAuthor2/1" }
					});
					const module2ChildActivity = createActivity({
						id: "D",
						descriptor: { model: "Book2", instance: "Book2/1" },
						initiatingActivityId: "C"
					});

					const mockParentActivity = createActivity({
						id: "E",
						descriptor: { model: "Parent", instance: "Parent/1" }
					});
					const mockChildActivity = createActivity({
						id: "F",
						descriptor: { model: "Child", instance: "Child/1" },
						initiatingActivityId: "E"
					});

					const module1ChildDataHolder = createDataHolder({
						descriptor: module1ChildActivity.descriptor
					});

					const module2ChildDataHolder = createDataHolder({
						descriptor: module2ChildActivity.descriptor
					});

					const mockChildDataHolder = createDataHolder({
						descriptor: mockChildActivity.descriptor
					});

					const dataProviders = ModuleExtensions.getDataProviders({});

					strictEqual(dataProviders.length, 1);

					strictEqual(
						dataProviders[0].canHandle({
							activityId: module1ChildActivity.id,
							activities: {
								[module1ParentActivity.id]: module1ParentActivity,
								[module1ChildActivity.id]: module1ChildActivity
							},
							dataHolder: module1ChildDataHolder,
							operation: "load"
						}),
						true
					);

					strictEqual(
						dataProviders[0].canHandle({
							activityId: module2ChildActivity.id,
							activities: {
								[module2ParentActivity.id]: module2ParentActivity,
								[module2ChildActivity.id]: module2ChildActivity
							},
							dataHolder: module2ChildDataHolder,
							operation: "load"
						}),
						true
					);

					strictEqual(
						dataProviders[0].canHandle({
							activityId: mockChildActivity.id,
							activities: {
								[mockParentActivity.id]: mockParentActivity,
								[mockChildActivity.id]: mockChildActivity
							},
							dataHolder: mockChildDataHolder,
							operation: "load"
						}),
						false
					);
				});
			});
		});
	});
});
