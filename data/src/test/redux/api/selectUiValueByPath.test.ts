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

import { strictEqual } from "node:assert/strict";

import type { Activity, Model } from "@com.mgmtp.a12.client/client-core";
import type { IGeneratedCodeAccessor } from "@com.mgmtp.a12.kernel/kernel-md-facade";
import { DocumentRtServiceFactoryA12internal } from "@com.mgmtp.a12.kernel/kernel-md-facade/a12internal";
import { defaultLocalizerFactory } from "@com.mgmtp.a12.utils/utils-localization";

import { initializeDataComponent } from "../../../core/api/initializeDataComponent.js";
import { KernelMessage } from "../../../data-mutation/validation-computation/message.js";
import type {
	ParseError,
	ValidationData
} from "../../../data-mutation/validation-computation/types.js";
import { DocumentRuntimeServiceFactory } from "../../../data-mutation/validation-computation/validationRuntimeService.js";
import { ValidatorProviderFactory } from "../../../data-mutation/validation-computation/validatorProviderFactory.js";
import type { DgDocument } from "../../../internal/documentGraph.js";
import { selectUiValueByPath } from "../../../redux/api/selectors.js";
import { KernelFixtures } from "../../setup/testValidationRuntime.js";

import { messageDefaults } from "./mocks/mockMessage.js";
import { setupStateWithDocuments } from "./mocks/mockState.js";

describe("redux.api.selectors", () => {
	describe("selectUiValueByPath", () => {
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
		// TODO: add tests for
		// - error when referring to groups
		// - references to multi-select / attachment
		// - undefined when no document is there

		it("returns the ui value for the field instance of the entry point document as references by the given DataReference", () => {
			const document: DgDocument = {
				docRef: "foo/1",
				documentModel: createTestDm("foo-dm"),
				loadingState: "loaded",
				document: {
					base: {
						stringField001: "abc",
						numberField001: 3.75
					}
				}
			};

			const state = setupStateWithDocuments([document]);

			strictEqual(
				selectUiValueByPath(state, "test-activity", "/base[1]/numberField001[1]", () => "", {
					formatValue: () => "3,75",
					parseValue: () => ({ value: 3.75 })
				}),
				"3,75"
			);
		});

		it("returns the localized value when the referenced field is of type 'confirm'", () => {
			const document: DgDocument = {
				docRef: "foo/1",
				documentModel: createTestDm("foo-dm"),
				loadingState: "loaded",
				document: {
					base: {
						confirmField001: true
					}
				}
			};

			const state = setupStateWithDocuments([document]);

			strictEqual(
				selectUiValueByPath(
					state,
					"test-activity",
					"/base[1]/confirmField001[1]",
					defaultLocalizerFactory({
						locale: { language: "en", country: "US" }
					}),
					{
						formatValue: () => "",
						parseValue: () => ({ value: true })
					}
				),
				"yes"
			);
		});

		it("returns the localized value when the referenced field is of type 'boolean'", () => {
			const document: DgDocument = {
				docRef: "foo/1",
				documentModel: createTestDm("foo-dm"),
				loadingState: "loaded",
				document: {
					base: {
						booleanField001: false
					}
				}
			};

			const state = setupStateWithDocuments([document]);

			strictEqual(
				selectUiValueByPath(
					state,
					"test-activity",
					"/base[1]/booleanField001[1]",
					defaultLocalizerFactory({
						locale: { language: "en", country: "US" }
					}),
					{
						formatValue: () => "",
						parseValue: () => ({ value: false })
					}
				),
				"no"
			);
		});

		it("returns the localized value when the referenced field is of type 'enumeration'", () => {
			const document: DgDocument = {
				docRef: "foo/1",
				documentModel: createTestDm("foo-dm"),
				loadingState: "loaded",
				document: {
					base: {
						enumField001: "b"
					}
				}
			};

			const state = setupStateWithDocuments([document]);

			strictEqual(
				selectUiValueByPath(
					state,
					"test-activity",
					"/base[1]/enumField001[1]",
					defaultLocalizerFactory({
						locale: { language: "en", country: "US" }
					}),
					{
						formatValue: () => "",
						parseValue: () => ({ value: "b" })
					}
				),
				"b_en"
			);
		});

		it("returns the error value for the respective field instance if a parse errors for this instance is present", () => {
			const document: DgDocument = {
				docRef: "foo/1",
				documentModel: createTestDm("foo-dm"),
				loadingState: "loaded",
				document: {
					base: {
						stringField001: "abc",
						numberField001: null
					}
				}
			};

			const expectedValue = "expected-error-value";

			const state = setupStateWithDocumentsAndParseErrors([document], {
				documentPath: "/base[1]/numberField001[1]",
				error: {
					value: expectedValue,
					message: {
						...messageDefaults,
						entityInstance: [
							{ elementName: "base", index: 1 },
							{ elementName: "numberField001", index: 1 }
						],
						errorCode: "invalid-number-value",
						errorText: [],
						messageType: "VALUE_ERROR",
						referencedFields: [],
						refOmissionErrorResponsible: [],
						rulePath: KernelMessage.FORMAL_VALIDATION,
						severity: "ERROR"
					}
				}
			});

			strictEqual(
				selectUiValueByPath(state, "test-activity", "/base[1]/numberField001[1]", () => "", {
					formatValue: () => "3,75",
					parseValue: () => ({ value: 3.75 })
				}),
				expectedValue
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
							},
							{
								id: "field-002",
								name: "numberField001",
								fieldType: {
									type: "NumberType",
									maxFractionalDigits: 2
								},
								type: "Field",
								label: [
									{
										locale: "en",
										text: "Number Field 001"
									}
								]
							},
							{
								id: "field-003",
								name: "confirmField001",
								fieldType: {
									type: "ConfirmType"
								},
								type: "Field",
								label: [
									{
										locale: "en",
										text: "Confirm Field 001"
									}
								]
							},
							{
								id: "field-004",
								name: "booleanField001",
								fieldType: {
									type: "BooleanType"
								},
								type: "Field",
								label: [
									{
										locale: "en",
										text: "Boolean Field 001"
									}
								]
							},
							{
								id: "field-005",
								name: "enumField001",
								fieldType: {
									type: "EnumerationType",
									values: [
										{
											value: "a",
											label: [
												{
													locale: "en",
													text: "a_en"
												}
											]
										},
										{
											value: "b",
											label: [
												{
													locale: "en",
													text: "b_en"
												}
											]
										}
									]
								},
								type: "Field",
								label: [
									{
										locale: "en",
										text: "Enum Field 001"
									}
								]
							}
						]
					}
				]
			},
			documentUniquenessCriteria: []
		},
		generatedCodeAccessor: undefined as unknown as IGeneratedCodeAccessor
	};
}

function setupStateWithDocumentsAndParseErrors(
	documents: DgDocument[],
	parseError: {
		documentPath: string;
		error: ParseError;
	}
): object {
	const descriptor: Activity.Descriptor = {
		instance: "test/1",
		model: "test-descriptor-model"
	};

	const entryPoint = documents[0].docRef;

	const data = {
		...initializeDataComponent({ documents, entryPoint }),
		validation: {
			[entryPoint]: {
				errorValues: {
					[parseError.documentPath]: parseError.error.value
				},
				messages: [parseError.error.message]
			}
		} as ValidationData
	};

	return {
		activities: {
			["test-activity"]: {
				activationTimestamp: 0,
				dataHolders: [
					{
						descriptor,
						loadingState: "loaded",
						savingState: "not_saved",
						dirty: false,
						slices: {},
						data
					}
				],
				descriptor,
				id: "test-activity"
			} as Activity
		}
	};
}
