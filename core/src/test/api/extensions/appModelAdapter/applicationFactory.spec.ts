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

import type { Store } from "redux";

import { AppModelAdapterModule } from "../../../../core/application/internal/adapter/appModelAdapterModule.js";
import type { A12ApplicationConfig } from "../../../../core/application/internal/factories/applicationConfig.js";
import {
	combineFeatures,
	withModel
} from "../../../../core/application/internal/factories/applicationFactory.js";
import { ModuleTestExtensions } from "../../../../core/application/internal/factories/moduleRegistryInstance.js";
import { ModuleRegistryProvider } from "../../../../core/application/internal/factories/moduleRegistryProvider.js";
import type { ApplicationModel } from "../../../../core/model/index.js";
import { APPLICATION_MODEL_PLACEHOLDER } from "../../../../core/model/index.js";
import { withAppModelAdapter } from "../../../../extensions/appModelAdapter/internal/applicationFactory.js";
import { toA12Config } from "../../../utils/test-utils.js";

describe("extensions.appModelAdapter.applicationFactory", () => {
	afterEach(() => {
		ModuleTestExtensions.reset();
	});

	it("withAppModelAdapter", async () => {
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });

		const result = withAppModelAdapter(baseConfig);

		equal(result.configured.appModelAdapter, true);
		notEqual(result.modelLoader?.supportedModelVersions, undefined);
		equal(result.config.model, APPLICATION_MODEL_PLACEHOLDER);

		await result.initialActions?.({} as Store);
		deepEqual(ModuleRegistryProvider.getInstance().getAllModules(), [AppModelAdapterModule]);
	});

	const ownModel = {
		header: { id: "own", modelType: "application", modelVersion: "6.0.0" },
		content: { modules: [], region: { name: "OWN", layout: { name: "Null" } }, defaultRegion: [] }
	} as ApplicationModel;

	it("withAppModelAdapter keeps an own application model, adapter first", () => {
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });

		const result = combineFeatures(withAppModelAdapter, withModel(ownModel))(baseConfig);

		equal(result.configured.appModelAdapter, true);
		equal(result.config.model, ownModel);
	});

	it("withAppModelAdapter keeps an own application model, withModel first", () => {
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });

		const result = combineFeatures(withModel(ownModel), withAppModelAdapter)(baseConfig);

		equal(result.configured.appModelAdapter, true);
		equal(result.config.model, ownModel);
	});
});
