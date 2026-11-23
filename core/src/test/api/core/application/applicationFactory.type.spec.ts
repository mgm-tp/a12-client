// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import {
	type ApplicationWithConfiguredFeature,
	type RequireFeatures
} from "../../../../core/application/index.js";
import { toA12Config } from "../../../utils/test-utils.js";

describe("core.application.applicationFactory", () => {
	it("should not compile if required feature is missing", () => {
		const baseConfig = toA12Config({ config: {}, configured: { 2: true }, 1: {} });
		type Test = RequireFeatures<typeof baseConfig, { 1: true }>;

		// @ts-expect-error test compile time feature
		const result: Test = baseConfig;
	});

	it("should not compile if feature is forbidden", () => {
		const baseConfig = toA12Config({ config: {}, configured: { 1: true }, 1: {} });
		type Test = RequireFeatures<typeof baseConfig, { 1: never }>;

		// @ts-expect-error test compile time feature
		const result: Test = baseConfig;
	});

	it("should include all configured features", () => {
		const baseConfig = toA12Config({ config: {}, configured: { 1: true }, 2: {}, 3: {} });

		type Chain1 = ApplicationWithConfiguredFeature<typeof baseConfig, 2>;
		type Chain2 = ApplicationWithConfiguredFeature<Chain1, 3>;
		type Test = Chain2["configured"] extends { 1: true; 2: true; 3: true } ? true : false;

		// @ts-expect-error test compile time feature
		const result: Test = false;
	});
});
