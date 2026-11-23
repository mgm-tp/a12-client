// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
