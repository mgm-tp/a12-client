// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepEqual, equal, notEqual } from "node:assert/strict";

import type { Store } from "redux";

import { AppModelAdapterModule } from "../../../../core/application/internal/adapter/appModelAdapterModule.js";
import type { A12ApplicationConfig } from "../../../../core/application/internal/factories/applicationConfig.js";
import { ModuleTestExtensions } from "../../../../core/application/internal/factories/moduleRegistryInstance.js";
import { ModuleRegistryProvider } from "../../../../core/application/internal/factories/moduleRegistryProvider.js";
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
});
