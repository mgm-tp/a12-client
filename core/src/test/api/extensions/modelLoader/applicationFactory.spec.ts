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

import { deepEqual, equal } from "node:assert/strict";

import { combineFeatures } from "../../../../core/application/index.js";
import type { ModelProcessor } from "../../../../core/model/index.js";
import {
	addModelProcessors,
	addSupportedModelVersion,
	withHTTPModelLoader,
	withPlatformModelLoader,
	type ApplicationWithModelLoaderConfig
} from "../../../../extensions/modelLoader/internal/applicationFactory.js";
import { toA12Config } from "../../../utils/test-utils.js";

const TEST_CASES = [withPlatformModelLoader, withHTTPModelLoader];

describe("extensions.modelLoader.applicationFactory", () => {
	TEST_CASES.forEach(testCase => {
		describe(testCase.name, () => {
			it("uses the supported model versions and model processors", () => {
				const expectedModelVersion = { ["document"]: ">=42" };
				const expectedModelProcessor = {} as ModelProcessor;
				const config: ApplicationWithModelLoaderConfig = toA12Config({
					config: {}
				});
				const add1 = addSupportedModelVersion("document", expectedModelVersion.document);
				const add2 = addModelProcessors(expectedModelProcessor);
				const finalConfig = combineFeatures(add1, add2)(config);
				const result = testCase(finalConfig);
				equal(result.configured.modelLoader, true);
				deepEqual(result.modelLoader?.modelProcessors, [expectedModelProcessor]);
				deepEqual(result.modelLoader?.supportedModelVersions, expectedModelVersion);
			});
		});
	});
});
