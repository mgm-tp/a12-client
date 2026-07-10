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

import { deepStrictEqual, ok, strictEqual } from "node:assert/strict";
import { mock, type Mock } from "node:test";

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api";
import type { JsonRpc2Request } from "@com.mgmtp.a12.dataservices/dataservices-access";
import { Dispatcher } from "@com.mgmtp.a12.dataservices/dataservices-access";
import { GeneratedCodeAccessorFactory } from "@com.mgmtp.a12.kernel/kernel-md-facade";

import { createNotFoundError } from "../../../../extensions/modelLoader/internal/createError.js";
import { platformServerModelFetcher } from "../../../../extensions/modelLoader/internal/platformModelLoader/platformServerModelFetcher.js";
import { RequestBuilder } from "../../../../extensions/modelLoader/internal/platformModelLoader/requestBuilder.js";

const codeFactory = new GeneratedCodeAccessorFactory();

describe("extensions.platform-server-connectors", () => {
	describe("platformServerModelFetcher", () => {
		let dispatchStub: Mock<typeof Dispatcher.rpc>;

		beforeEach(() => {
			dispatchStub = mock.method(Dispatcher, "rpc");
		});

		it("dispatches a `listModels` request containing all models", async () => {
			dispatchStub.mock.mockImplementation((() =>
				Promise.resolve([
					{ id: "", jsonrpc: "2.0", result: { models: [] } }
				])) as typeof Dispatcher.rpc);

			void (await platformServerModelFetcher([
				{ modelType: "A", name: "A" },
				{ modelType: "B", name: "B" },
				{ modelType: "C", name: "C" }
			]));

			const [, [listRequest, codesRequest]] = dispatchStub.mock.calls[0].arguments;

			deepStrictEqual(removeId(listRequest), removeId(RequestBuilder.listModels(["A", "B", "C"])));
			strictEqual(codesRequest, undefined);
		});

		it("returns an object for each model id, containing the loaded model from the response", async () => {
			dispatchStub.mock.mockImplementation((() =>
				Promise.resolve([
					{
						id: "",
						jsonrpc: "2.0",
						result: {
							models: {
								A: mockModel("A"),
								B: mockModel("B"),
								C: mockModel("C")
							}
						}
					}
				])) as typeof Dispatcher.rpc);

			const result = await platformServerModelFetcher([
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

		it("returns an object for each model id, containing errors for models that do not have a response", async () => {
			dispatchStub.mock.mockImplementation((() =>
				Promise.resolve([
					{
						id: "",
						jsonrpc: "2.0",
						result: {
							models: {
								// A and C are missing if user has no permission for them
								B: mockModel("B")
							}
						}
					}
				])) as typeof Dispatcher.rpc);

			const result = await platformServerModelFetcher([
				{ modelType: "A", name: "A" },
				{ modelType: "B", name: "B" },
				{ modelType: "C", name: "C" }
			]);

			deepStrictEqual(result, [
				{ modelId: "A", result: createNotFoundError({ modelType: "A", name: "A" }) },
				{ modelId: "B", result: mockModel("B") },
				{ modelId: "C", result: createNotFoundError({ modelType: "C", name: "C" }) }
			]);
		});

		it("additionally dispatches a `listValidationCodes` request when containing document models", async () => {
			dispatchStub.mock.mockImplementation((() =>
				Promise.resolve([
					{ id: "", jsonrpc: "2.0", result: { models: [] } }
				])) as typeof Dispatcher.rpc);

			void (await platformServerModelFetcher([
				{ modelType: "document", name: "A" },
				{ modelType: "document", name: "B" }
			]));

			const [, requests] = dispatchStub.mock.calls[0].arguments;
			strictEqual(requests.length, 2);

			deepStrictEqual(removeId(requests[0]), removeId(RequestBuilder.listModels(["A", "B"])));
			deepStrictEqual(
				removeId(requests[1]),
				removeId(RequestBuilder.listValidationCodes(["A", "B"]))
			);
		});

		it("for each document model response, also includes the validation code in the result", async () => {
			dispatchStub.mock.mockImplementation((() =>
				Promise.resolve([
					{
						id: "",
						jsonrpc: "2.0",
						result: {
							models: {
								A: mockModel("A", "document"),
								B: mockModel("B", "document")
							}
						}
					},
					{
						id: "",
						jsonrpc: "2.0",
						result: {
							documentValidationCodes: {
								A: "CodeA",
								B: "CodeB"
							}
						}
					}
				])) as typeof Dispatcher.rpc);

			const result = await platformServerModelFetcher([
				{ modelType: "document", name: "A" },
				{ modelType: "document", name: "B" }
			]);

			deepStrictEqual(result, [
				{
					modelId: "A",
					result: {
						...mockModel("A", "document"),
						generatedCodeAccessor: codeFactory.createScriptAccessor("CodeA")
					}
				},
				{
					modelId: "B",
					result: {
						...mockModel("B", "document"),
						generatedCodeAccessor: codeFactory.createScriptAccessor("CodeB")
					}
				}
			]);
		});

		it("returns a 'model not found' error for each model when dispatching fails", async () => {
			const mockError = "MOCK_ERROR";

			dispatchStub.mock.mockImplementation(() => Promise.reject(mockError));

			const result = await platformServerModelFetcher([
				{ modelType: "A", name: "A" },
				{ modelType: "B", name: "B" },
				{ modelType: "C", name: "C" }
			]);

			deepStrictEqual(result, [
				{ modelId: "A", result: createNotFoundError({ modelType: "A", name: "A" }, mockError) },
				{ modelId: "B", result: createNotFoundError({ modelType: "B", name: "B" }, mockError) },
				{ modelId: "C", result: createNotFoundError({ modelType: "C", name: "C" }, mockError) }
			]);
		});
	});
});

function mockModel(id: string, type?: string): ModelAPI {
	return {
		header: { id, modelVersion: "1", modelType: type ?? id },
		content: {}
	};
}

function removeId(req?: JsonRpc2Request): Omit<JsonRpc2Request, "id"> {
	ok(req);

	const { id, ...rest } = req;
	return rest;
}
