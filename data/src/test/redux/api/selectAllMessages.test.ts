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

import type { Activity } from "@com.mgmtp.a12.client/client-core";
import type { IGeneratedCodeAccessor, Message } from "@com.mgmtp.a12.kernel/kernel-md-facade";
import { DocumentRtServiceFactoryA12internal } from "@com.mgmtp.a12.kernel/kernel-md-facade/a12internal";

import { initializeDataComponent } from "../../../core/api/initializeDataComponent.js";
import { KernelMessage } from "../../../data-mutation/validation-computation/message.js";
import type { ValidationData } from "../../../data-mutation/validation-computation/types.js";
import { DocumentRuntimeServiceFactory } from "../../../data-mutation/validation-computation/validationRuntimeService.js";
import { ValidatorProviderFactory } from "../../../data-mutation/validation-computation/validatorProviderFactory.js";
import type { ComputedFields, DgDocument } from "../../../internal/documentGraph.js";
import { selectAllMessages } from "../../../redux/api/selectors.js";
import { KernelFixtures } from "../../setup/testValidationRuntime.js";

describe("redux.api.selectors", () => {
	describe("selectAllMessages", () => {
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

		it("returns the list of Messages including all parse errors that are currently present in the state", () => {
			const validationData: ValidationData = {
				"foo/1": {
					errorValues: {
						"/base[1]/stringField001[1]": "my-test-error-value",
						"/base[1]/numberField001[1]": "my-test-error-value"
					},
					messages: [
						{
							entityInstance: [
								{ elementName: "base", index: 1 },
								{ elementName: "stringField001", index: 1 }
							],
							errorCode: "my-test-rule-1-error",
							errorText: [],
							messageType: "VALUE_ERROR",
							referencedFields: [],
							refOmissionErrorResponsible: [],
							rulePath: "/base/testRule01",
							severity: "ERROR"
						},
						{
							entityInstance: [
								{ elementName: "base", index: 1 },
								{ elementName: "stringField001", index: 1 }
							],
							errorCode: "invalid-string-value",
							errorText: [],
							messageType: "VALUE_ERROR",
							referencedFields: [],
							refOmissionErrorResponsible: [],
							rulePath: KernelMessage.FORMAL_VALIDATION,
							severity: "ERROR"
						},
						{
							entityInstance: [
								{ elementName: "base", index: 1 },
								{ elementName: "numberField001", index: 1 }
							],
							errorCode: "my-test-rule-1-error",
							errorText: [],
							messageType: "VALUE_ERROR",
							referencedFields: [],
							refOmissionErrorResponsible: [],
							rulePath: "/base/testRule01",
							severity: "ERROR"
						},
						{
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
					]
				}
			};

			const state = setupStateWithErrors(validationData);

			deepStrictEqual(selectAllMessages(state, "test-activity"), validationData["foo/1"]?.messages);
		});

		it("returns the list of Messages excluding all referenced fields that are not relevant", () => {
			const validationData: ValidationData = {
				"foo/1": {
					errorValues: {},
					messages: [
						{
							entityInstance: [
								{ elementName: "base", index: 1 },
								{ elementName: "stringField001", index: 1 }
							],
							errorCode: "my-test-rule-1-error",
							errorText: [],
							messageType: "VALUE_ERROR",
							referencedFields: [
								[
									{ elementName: "base", index: 1 },
									{ elementName: "stringField001", index: 1 }
								],
								[
									{ elementName: "base", index: 1 },
									{
										elementName: "confirmField001",
										index: 1
									}
								]
							],
							refOmissionErrorResponsible: [],
							rulePath: "/base/testRule01",
							severity: "ERROR"
						},
						{
							entityInstance: [
								{ elementName: "base", index: 1 },
								{ elementName: "numberField001", index: 1 }
							],
							errorCode: "my-test-rule-2-error",
							errorText: [],
							messageType: "VALUE_ERROR",
							referencedFields: [
								[
									{ elementName: "base", index: 1 },
									{ elementName: "numberField001", index: 1 }
								], // this reference must be removed due to non-relevancy
								[
									{ elementName: "base", index: 1 },
									{ elementName: "boolField001", index: 1 }
								]
							],
							refOmissionErrorResponsible: [],
							rulePath: "/base/testRule02",
							severity: "ERROR"
						}
					]
				}
			};

			const state = setupStateWithErrors(validationData);
			const messages = selectAllMessages(state, "test-activity");

			const expectedFilteredMsg: Message = {
				// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
				...validationData["foo/1"]?.messages[1]!,
				referencedFields: [
					[
						{ elementName: "base", index: 1 },
						{ elementName: "numberField001", index: 1 }
					]
				]
			};

			deepStrictEqual(messages, [
				// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
				validationData["foo/1"]?.messages[0]!,
				expectedFilteredMsg
			]);
		});

		it("returns the list of Messages including all referenced computed fields expanded with their operands", () => {
			const validationData: ValidationData = {
				"foo/1": {
					errorValues: {},
					messages: [
						{
							entityInstance: [
								{ elementName: "base", index: 1 },
								{ elementName: "stringField001", index: 1 }
							],
							errorCode: "my-test-rule-1-error",
							errorText: [],
							messageType: "VALUE_ERROR",
							referencedFields: [
								[
									{ elementName: "base", index: 1 },
									{ elementName: "stringField001", index: 1 }
								]
							],
							refOmissionErrorResponsible: [],
							rulePath: "/base/testRule01",
							severity: "ERROR"
						}
					]
				}
			};

			const state = setupStateWithErrors(validationData, {
				"/base/stringField001": ["/base/numberField001", "/base/confirmField001"]
			});
			const messages = selectAllMessages(state, "test-activity");

			const expectedExpandedMsg: Message = {
				// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
				...validationData["foo/1"]?.messages[0]!,
				referencedFields: [
					[
						{ elementName: "base", index: 1 },
						{ elementName: "numberField001", index: 1 }
					],
					[
						{ elementName: "base", index: 1 },
						{ elementName: "confirmField001", index: 1 }
					],
					[
						{ elementName: "base", index: 1 },
						{ elementName: "stringField001", index: 1 }
					]
				]
			};

			deepStrictEqual(messages, [expectedExpandedMsg]);
		});

		it("returns an empty list of Messages when no errors are present in the state", () => {
			const state = setupStateWithErrors({
				"foo/1": { errorValues: {}, messages: [] }
			});

			deepStrictEqual(selectAllMessages(state, "test-activity"), []);
		});

		it("returns an empty list of Messages when there is no entry point document", () => {
			const state = setupStateWithoutAnything();

			deepStrictEqual(selectAllMessages(state, "test-activity"), []);
		});
	});
});

function setupStateWithErrors(
	validation?: ValidationData,
	computedFields?: ComputedFields
): object {
	const descriptor: Activity.Descriptor = {
		instance: "test/1",
		model: "test-descriptor-model"
	};

	const dmName = "foo-dm";
	const doc: DgDocument = {
		docRef: "foo/1",
		document: {
			base: {
				stringField001: "abc",
				numberField001: 123,
				confirmField001: null,
				boolField001: undefined
			}
		},
		documentModel: {
			header: {
				id: dmName,
				modelType: "document",
				modelVersion: "99.99.99"
			},
			content: {
				modelConfig: { timeZone: "UTC" },
				modelInfo: {},
				modelRoot: {
					id: "ROOT",
					name: "ROOT",
					type: "Group",
					repeatability: 1,
					elements: [
						{
							id: "group-001",
							type: "Group",
							repeatability: 1,
							name: "base",
							elements: [
								{
									id: "stringField001",
									name: "stringField001",
									fieldType: {
										type: "StringType"
									},
									type: "Field"
								},
								{
									id: "numberField001",
									name: "numberField001",
									fieldType: {
										type: "NumberType"
									},
									type: "Field"
								},
								{
									id: "confirmField001",
									name: "confirmField001",
									fieldType: {
										type: "ConfirmType"
									},
									type: "Field"
								},
								{
									id: "boolField001",
									name: "boolField001",
									fieldType: {
										type: "BooleanType"
									},
									type: "Field"
								}
							]
						}
					]
				},
				documentUniquenessCriteria: []
			},
			generatedCodeAccessor: undefined as unknown as IGeneratedCodeAccessor
		},
		notRelevantConfigs: [
			{
				["/base/boolField001"]: {
					cases: [
						{
							conditions: [
								{
									fieldPath: [{ elementName: "base" }, { elementName: "confirmField001" }],
									value: null
								}
							]
						}
					]
				}
			}
		],
		computedFields,
		loadingState: "loaded"
	};

	const entryPoint = doc.docRef;

	const data = {
		...initializeDataComponent({ documents: [doc], entryPoint }),
		validation
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

function setupStateWithoutAnything(): object {
	const descriptor: Activity.Descriptor = {
		instance: "test/1",
		model: "test-descriptor-model"
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
						data: initializeDataComponent({ documents: [] })
					}
				],
				descriptor,
				id: "test-activity"
			} as Activity
		}
	};
}
