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

import { deepStrictEqual, strictEqual } from "node:assert/strict";
import { mock, type Mock } from "node:test";

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import { GeneratedCodeAccessorFactory } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/facade.js";

import { createHttpModelFetcher } from "../../../../extensions/modelLoader/index.js";
import { createNotFoundError } from "../../../../extensions/modelLoader/internal/createError.js";

const codeFactory = new GeneratedCodeAccessorFactory();

describe("extensions.http-connectors", () => {
	describe("createHttpModelFetcher", () => {
		let fetchStub: Mock<typeof global.fetch>;

		beforeEach(() => {
			fetchStub = mock.method(global, "fetch");
		});

		it("fetches and wraps data from the server for each model descriptor", async () => {
			fetchStub.mock.mockImplementation(
				async requestInfo =>
					new Response(JSON.stringify(mockModel(requestInfo.toString().slice(1, -5))))
			);

			const result = await createHttpModelFetcher()([
				{ modelType: "A", name: "A" },
				{ modelType: "B", name: "B" },
				{ modelType: "C", name: "C" }
			]);
			deepStrictEqual(result, [
				{ modelId: "A", result: mockModel("A") },
				{ modelId: "B", result: mockModel("B") },
				{ modelId: "C", result: mockModel("C") }
			]);
		});

		it("performs two fetches for document models and wraps in a single result", async () => {
			fetchStub.mock.mockImplementation(async requestInfo => {
				const name = requestInfo.toString().slice(1);

				return new Response(
					name.endsWith(".json")
						? JSON.stringify(mockModel(name.slice(0, -5), "document"))
						: `Code${name.slice(0, -14)}`
				);
			});

			const result = await createHttpModelFetcher()([{ modelType: "document", name: "A" }]);
			deepStrictEqual(result, [
				{
					modelId: "A",
					result: {
						...mockModel("A", "document"),
						generatedCodeAccessor: codeFactory.createScriptAccessor("CodeA")
					}
				}
			]);
		});

		it("wraps fetch errors in a model error", async () => {
			fetchStub.mock.mockImplementation(async requestInfo => {
				const name = requestInfo.toString().slice(1, -5);

				throw new Error(name);
			});

			const result = await createHttpModelFetcher()([
				{ modelType: "A", name: "A" },
				{ modelType: "B", name: "B" }
			]);
			deepStrictEqual(result, [
				{
					modelId: "A",
					result: createNotFoundError({ modelType: "A", name: "A" }, new Error(`A`))
				},
				{
					modelId: "B",
					result: createNotFoundError({ modelType: "B", name: "B" }, new Error(`B`))
				}
			]);
		});

		it("allows changing the url by passing the basePath parameter", async () => {
			fetchStub.mock.mockImplementation(async () => new Response(JSON.stringify(mockModel("A"))));

			void (await createHttpModelFetcher("CHANGED/")([{ modelType: "A", name: "A" }]));

			strictEqual(fetchStub.mock.calls[0].arguments[0].toString().startsWith("CHANGED/"), true);
		});
	});
});

function mockModel(id: string, type?: string): ModelAPI {
	return {
		header: { id, modelVersion: "1", modelType: type ?? id },
		content: {}
	};
}
