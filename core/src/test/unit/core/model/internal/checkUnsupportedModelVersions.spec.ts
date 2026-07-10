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

import { deepStrictEqual } from "node:assert/strict";

import type { Header, Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api";

import type { SupportedModelVersions } from "../../../../../core/model/index.js";
import type { Model } from "../../../../../core/model/internal/Model.js";
import {
	checkUnsupportedModelVersion,
	createIncompatibleModelError
} from "../../../../../core/model/internal/checkUnsupportedModelVersion.js";

declare global {
	var __A12_MODEL_VERSIONS__: SupportedModelVersions | undefined;
}

describe("core.model.internal", () => {
	describe("checkUnsupportedModelVersion", () => {
		before(() => {
			Object.defineProperty(global, "__A12_MODEL_VERSIONS__", {
				configurable: true,
				writable: true,
				enumerable: true
			});
		});

		after(() => {
			delete global.__A12_MODEL_VERSIONS__;
		});

		describe("without a map of supported A12 model versions", () => {
			before(() => {
				__A12_MODEL_VERSIONS__ = undefined;
			});

			it("returns given modelMap unchanged", () => {
				const modelMap = {
					A: mockModel({ id: "A" }),
					B: mockErr("error for b"),
					C: mockModel({ id: "C" })
				};

				const result = checkUnsupportedModelVersion(modelMap);

				deepStrictEqual(result, modelMap);
			});
		});

		describe("with a map of supported A12 model versions", () => {
			after(() => {
				__A12_MODEL_VERSIONS__ = undefined;
			});

			it("keeps existing errors unchanged", () => {
				__A12_MODEL_VERSIONS__ = {
					anyType: "1.x",
					otherType: "^3 >3.4"
				};

				const modelMap = {
					A: mockErr("error for a"),
					B: mockErr("error for b"),
					C: mockErr("error for c")
				};

				const result = checkUnsupportedModelVersion(modelMap);

				deepStrictEqual(result, modelMap);
			});

			it("keeps models that match the given version range for their model type", () => {
				__A12_MODEL_VERSIONS__ = {
					anyType: "1.x",
					otherType: "^3 >3.4"
				};

				const modelMap = {
					A: mockModel({ id: "A", modelType: "anyType", modelVersion: "1.0.0" }),
					B: mockModel({ id: "B", modelType: "anyType", modelVersion: "1.2.3" }),
					C: mockModel({ id: "C", modelType: "otherType", modelVersion: "3.5.1" }),
					D: mockModel({ id: "D", modelType: "otherType", modelVersion: "3.9.9" })
				};

				const result = checkUnsupportedModelVersion(modelMap);

				deepStrictEqual(result, modelMap);
			});

			it("keeps models that do not contain an entry for their model type in the map", () => {
				__A12_MODEL_VERSIONS__ = {
					otherType: "2.x"
				};

				const modelMap = {
					A: mockModel({ id: "A", modelType: "anyType", modelVersion: "1" }),
					B: mockModel({ id: "B", modelType: "anyType", modelVersion: "1.5" }),
					C: mockModel({ id: "C", modelType: "anyType", modelVersion: "1.9" })
				};

				const result = checkUnsupportedModelVersion(modelMap);

				deepStrictEqual(result, modelMap);
			});

			it("creates errors for models that do not match the given version range for their model type", () => {
				__A12_MODEL_VERSIONS__ = {
					anyType: "1.x",
					otherType: "^3 >3.4"
				};

				const modelMap = {
					A: mockModel({ id: "A", modelType: "anyType", modelVersion: "0.1" }),
					B: mockModel({ id: "B", modelType: "anyType", modelVersion: "2.0" }),
					C: mockModel({ id: "C", modelType: "otherType", modelVersion: "3.3" }),
					D: mockModel({ id: "D", modelType: "otherType", modelVersion: "5" })
				};

				const result = checkUnsupportedModelVersion(modelMap);

				deepStrictEqual(result, {
					A: createIncompatibleModelError("0.1", "1.x", "anyType", "A"),
					B: createIncompatibleModelError("2.0", "1.x", "anyType", "B"),
					C: createIncompatibleModelError("3.3", "^3 >3.4", "otherType", "C"),
					D: createIncompatibleModelError("5", "^3 >3.4", "otherType", "D")
				});
			});
		});
	});
});

function mockModel(header: Partial<Header>): ModelAPI {
	return {
		header: { id: "test", modelType: "any", modelVersion: "1", ...header },
		content: {}
	};
}

function mockErr(message?: string): Model.Error {
	return {
		type: "UNKNOWN",
		message
	};
}
