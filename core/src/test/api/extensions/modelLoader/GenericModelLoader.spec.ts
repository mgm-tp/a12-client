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
import type { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";
import { GeneratedCodeAccessorFactory } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/facade.js";

import type { ModelProcessor } from "../../../../core/model/index.js";
import { Model } from "../../../../core/model/index.js";
import type { ModelFetcher } from "../../../../extensions/modelLoader/index.js";
import { GenericModelLoader } from "../../../../extensions/modelLoader/internal/GenericModelLoader.js";
import { readModel, readModelFile } from "../../../mocks/ModelsUtil.js";

const codeFactory = new GeneratedCodeAccessorFactory();

describe("extensions.http-connectors", () => {
	describe("GenericModelLoader", () => {
		const fetcherStub: Mock<ModelFetcher> = mock.fn();
		const modelLoader = new GenericModelLoader(fetcherStub);

		it("has the same name as the class", () => {
			strictEqual(modelLoader.name, "GenericModelLoader");
		});

		it("returns an object mapping ids of given models to their fetched result", async () => {
			fetcherStub.mock.mockImplementation(async descriptors =>
				descriptors.map(d => ({
					modelId: d.name,
					result: d.name === "B" ? mockErr("failed") : mockModel(d.name)
				}))
			);

			const result = await modelLoader.load(
				[
					{ modelType: "A", name: "A" },
					{ modelType: "B", name: "B" },
					{ modelType: "C", name: "C" }
				],
				{}
			);

			deepStrictEqual(result, {
				A: mockModel("A"),
				B: mockErr("failed"),
				C: mockModel("C")
			});
		});

		describe("ModelProcessor", () => {
			it("uses custom processor for all models of matching types", async () => {
				fetcherStub.mock.mockImplementation(async descriptors =>
					descriptors.map(d => ({
						modelId: d.name,
						result: mockModel(d.name)
					}))
				);

				const processors: ModelProcessor[] = [
					{
						modelType: "A",
						processModel(m) {
							return { ...m, processed: "A" };
						}
					},
					{
						modelType: "C",
						processModel(m) {
							return { ...m, processed: "C" };
						}
					}
				];

				const customLoader = new GenericModelLoader(fetcherStub, processors);

				const result = await customLoader.load(
					[
						{ modelType: "A", name: "A" },
						{ modelType: "B", name: "B" },
						{ modelType: "C", name: "C" }
					],
					{}
				);

				deepStrictEqual(result, {
					A: processors[0].processModel(mockModel("A"), {}),
					B: mockModel("B"),
					C: processors[1].processModel(mockModel("C"), {})
				});
			});

			it("only uses the first custom processor for matching types if multiple exist", async () => {
				fetcherStub.mock.mockImplementation(async descriptors =>
					descriptors.map(d => ({
						modelId: d.name,
						result: mockModel(d.name)
					}))
				);

				const processors: ModelProcessor[] = [
					{
						modelType: "A",
						processModel(m) {
							return { ...m, processed: "A_first" };
						}
					},
					{
						modelType: "A",
						processModel(m) {
							return { ...m, processed: "A_second" };
						}
					}
				];

				const customLoader = new GenericModelLoader(fetcherStub, processors);

				const result = await customLoader.load([{ modelType: "A", name: "A" }], {});

				strictEqual(
					result["A"] !== undefined &&
						"processed" in result["A"] &&
						result["A"].processed === "A_first",
					true
				);
			});
		});

		describe("when loading a document model", () => {
			describe("ModelProcessor", () => {
				it("uses the default processor if no custom processor exists for document models", async () => {
					fetcherStub.mock.mockImplementation(async descriptors =>
						descriptors.map(d => ({
							modelId: d.name,
							result: {
								...(readModel(d.name) as DocumentModel),
								generatedCodeAccessor: codeFactory.createScriptAccessor(
									readModelFile(`${d.name}.validation.js`)
								)
							}
						}))
					);

					const processors: ModelProcessor[] = [
						{
							modelType: "other",
							processModel(m) {
								return { ...m, processed: true };
							}
						}
					];

					const customLoader = new GenericModelLoader(fetcherStub, processors);

					const result = await customLoader.load(
						[{ modelType: "document", name: "Mock-document" }],
						{}
					);

					const dm = result["Mock-document"];

					strictEqual(
						dm !== undefined &&
							!Model.Error.isInstance(dm) &&
							Model.isDocumentAndValidationModel(dm),
						true
					);
				});

				it("uses the custom processor instead of the default one if one exists", async () => {
					fetcherStub.mock.mockImplementation(async descriptors =>
						descriptors.map(d => ({
							modelId: d.name,
							result: mockModel(d.name, "document")
						}))
					);

					const processors: ModelProcessor[] = [
						{
							modelType: "document",
							processModel(m) {
								return { ...m, processed: true };
							}
						}
					];

					const customLoader = new GenericModelLoader(fetcherStub, processors);

					const result = await customLoader.load(
						[
							{ modelType: "document", name: "A" },
							{ modelType: "document", name: "B" }
						],
						{}
					);

					deepStrictEqual(result, {
						A: processors[0].processModel(mockModel("A", "document"), {}),
						B: processors[0].processModel(mockModel("B", "document"), {})
					});
				});

				it("only uses the first custom processor for documents if multiple exist", async () => {
					fetcherStub.mock.mockImplementation(async descriptors =>
						descriptors.map(d => ({
							modelId: d.name,
							result: mockModel(d.name, "document")
						}))
					);

					const processors: ModelProcessor[] = [
						{
							modelType: "document",
							processModel(m) {
								return { ...m, processed: "D_first" };
							}
						},
						{
							modelType: "document",
							processModel(m) {
								return { ...m, processed: "D_second" };
							}
						}
					];

					const customLoader = new GenericModelLoader(fetcherStub, processors);

					const result = await customLoader.load([{ modelType: "document", name: "D" }], {});

					strictEqual(
						result["D"] !== undefined &&
							"processed" in result["D"] &&
							result["D"].processed === "D_first",
						true
					);
				});
			});

			it("processes the document correctly", async () => {
				fetcherStub.mock.mockImplementation(async descriptors =>
					descriptors.map(d => ({
						modelId: d.name,
						result: {
							...(readModel(d.name) as DocumentModel),
							generatedCodeAccessor: codeFactory.createScriptAccessor(
								readModelFile(`${d.name}.validation.js`)
							)
						}
					}))
				);

				const result = await modelLoader.load(
					[{ modelType: "document", name: "Mock-document" }],
					{}
				);

				const dm = result["Mock-document"];

				strictEqual(
					dm !== undefined && !Model.Error.isInstance(dm) && Model.isDocumentAndValidationModel(dm),
					true
				);
			});

			it("creates an error entry if the validation code is invalid", async () => {
				fetcherStub.mock.mockImplementation(async descriptors =>
					descriptors.map(d => ({
						modelId: d.name,
						result: {
							...(readModel(d.name) as DocumentModel),
							generatedCodeAccessor: codeFactory.createScriptAccessor("invalid code")
						}
					}))
				);

				const result = await modelLoader.load(
					[{ modelType: "document", name: "Mock-document" }],
					{}
				);

				const dm = result["Mock-document"];

				strictEqual(Model.Error.isInstance(dm), true);
			});
		});
	});
});

function mockModel(id: string, type?: string): ModelAPI {
	return {
		header: { id, modelVersion: "1", modelType: type ?? id },
		content: {}
	};
}

function mockErr(message?: string): Model.Error {
	return {
		type: "UNKNOWN",
		message
	};
}
