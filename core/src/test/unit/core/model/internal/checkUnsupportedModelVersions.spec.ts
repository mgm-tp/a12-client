// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual } from "node:assert/strict";

import type { Header } from "@com.mgmtp.a12.base/base-model-api/lib/main/header/index.js";
import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";

import type { SupportedModelVersions } from "../../../../../core/model/index.js";
import {
	checkUnsupportedModelVersion,
	createIncompatibleModelError
} from "../../../../../core/model/internal/checkUnsupportedModelVersion.js";
import type { Model } from "../../../../../core/model/internal/Model.js";

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
