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
