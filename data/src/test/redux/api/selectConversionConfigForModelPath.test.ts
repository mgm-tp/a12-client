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

import { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { Model } from "@com.mgmtp.a12.client/client-core";
import { DocumentRtServiceFactoryA12internal } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/a12internal/compute.js";
import type { IGeneratedCodeAccessor } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";
import type { ValueConversionConfig } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";

import { DocumentRuntimeServiceFactory } from "../../../data-mutation/validation-computation/validationRuntimeService.js";
import { ValidatorProviderFactory } from "../../../data-mutation/validation-computation/validatorProviderFactory.js";
import type { DgDocument } from "../../../internal/documentGraph.js";
import { selectConversionConfigForModelPath } from "../../../redux/api/selectors.js";
import { KernelFixtures } from "../../setup/testValidationRuntime.js";

import { setupStateWithDocuments } from "./mocks/mockState.js";

describe("redux.api.selectors", () => {
	describe("selectConversionConfigForModelPath", () => {
		beforeEach(() => {
			ValidatorProviderFactory.set(
				KernelFixtures.ValidatorProvider.instance({
					metaFields: []
				})
			);
			DocumentRuntimeServiceFactory.set(KernelFixtures.RtService.runtimeFactory({}));
		});
		afterEach(() => {
			ValidatorProviderFactory.set({
				getValidatorProvider: dm => dm.generatedCodeAccessor
			});
			DocumentRuntimeServiceFactory.set(DocumentRtServiceFactoryA12internal);
		});

		it("returns the conversion config for the field as given by the model path parameter", () => {
			const document: DgDocument = {
				docRef: "foo/1",
				documentModel: createTestDm("foo-dm"),
				loadingState: "loaded",
				document: {
					base: {
						stringField001: "abc"
					}
				}
			};

			const state = setupStateWithDocuments([document]);

			const expectedResult: ValueConversionConfig = {
				type: "StringType",
				modelId: "foo-dm",
				modelPath: [{ elementName: "base" }, { elementName: "stringField001" }]
			};

			deepStrictEqual(
				selectConversionConfigForModelPath(
					state,
					"test-activity",
					ModelPath.fromString("/base/stringField001")
				),
				expectedResult
			);
		});

		it("returns undefined if the given model path does not match a field in the entry point document model", () => {
			const document: DgDocument = {
				docRef: "foo/1",
				documentModel: createTestDm("foo-dm"),
				loadingState: "loaded",
				document: {
					base: {
						stringField001: "abc"
					}
				}
			};

			const state = setupStateWithDocuments([document]);

			strictEqual(
				selectConversionConfigForModelPath(
					state,
					"test-activity",
					ModelPath.fromString("/nonExistantRootGroup/stringField001")
				),
				undefined
			);
		});

		it("returns undefined if the given model path does not reference a field in the entry point document model", () => {
			const document: DgDocument = {
				docRef: "foo/1",
				documentModel: createTestDm("foo-dm"),
				loadingState: "loaded",
				document: {
					base: {
						stringField001: "abc"
					}
				}
			};

			const state = setupStateWithDocuments([document]);

			strictEqual(
				selectConversionConfigForModelPath(state, "test-activity", ModelPath.fromString("/base")),
				undefined
			);
		});
	});
});

function createTestDm(name: string): Model.DocumentAndValidationModel {
	return {
		header: {
			id: name,
			modelType: "document",
			modelVersion: "99.99.99"
		},
		content: {
			modelInfo: {},
			modelConfig: {
				timeZone: "UTC"
			},
			modelRoot: {
				id: "ROOT",
				type: "Group",
				name: "ROOT_GROUP",
				repeatability: 1,
				elements: [
					{
						id: "group-001",
						type: "Group",
						repeatability: 1,
						name: "base",
						elements: [
							{
								id: "field-001",
								name: "stringField001",
								fieldType: {
									type: "StringType"
								},
								type: "Field",
								label: [
									{
										locale: "en",
										text: "String Field 001"
									}
								]
							}
						]
					}
				]
			}
		},
		generatedCodeAccessor: undefined as unknown as IGeneratedCodeAccessor
	};
}
