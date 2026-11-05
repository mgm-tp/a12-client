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

import {
	deepStrictEqual,
	notStrictEqual,
	partialDeepStrictEqual,
	strictEqual
} from "node:assert/strict";

import type { ModelPath } from "@com.mgmtp.a12.base/base-model-api";
import type { Activity, Model } from "@com.mgmtp.a12.client/client-core";
import type {
	EntityInstancePath,
	FieldInstanceValue,
	GeneratedCodeRtConfig,
	Message
} from "@com.mgmtp.a12.kernel/kernel-md-facade";
import { DocumentRtServiceFactoryA12internal } from "@com.mgmtp.a12.kernel/kernel-md-facade/a12internal";

import { initializeDataComponent } from "../../../core/api/initializeDataComponent.js";
import type {
	NotRelevantConfig,
	NotRelevantConfigEntry
} from "../../../core/api/model/relevance/notRelevantConfig.js";
import { handleValidatePart } from "../../../data-mutation/validation-computation/validation.js";
import { DocumentRuntimeServiceFactory } from "../../../data-mutation/validation-computation/validationRuntimeService.js";
import { ValidatorProviderFactory } from "../../../data-mutation/validation-computation/validatorProviderFactory.js";
import type { DgDocument } from "../../../internal/documentGraph.js";
import { DataActions } from "../../../redux/api/actions.js";
import type { DgClAndValidationDataHolderShape } from "../../../redux/api/types.js";
import { KernelFixtures } from "../../setup/testValidationRuntime.js";

import { messageDefaults } from "./mocks/mockMessage.js";

describe("redux.api.reducers", () => {
	beforeEach(() => {
		ValidatorProviderFactory.set(
			KernelFixtures.ValidatorProvider.instance({
				metaFields: []
			})
		);
	});
	afterEach(() => {
		DocumentRuntimeServiceFactory.set(DocumentRtServiceFactoryA12internal);
		KernelFixtures.RtService.resetHistory();
		ValidatorProviderFactory.set({
			getValidatorProvider: dm => dm.generatedCodeAccessor
		});
	});

	/*
    TODO:
    - empty relevant instances in action payload
    - existing parse errors in state -> they may not be removed (for validation-relevant fields)
    - existing computations errors in state -> they may not be removed (for validation-relevant fields)
    - validation successful
    */

	describe("handleValidatePart", () => {
		it("validates given relevant element instances of the entry point document", () => {
			DocumentRuntimeServiceFactory.set(KernelFixtures.RtService.runtimeFactory({}));

			const doc: DgDocument = {
				docRef: "foo/1",
				document: {
					base: {
						aField: "bar"
					}
				},
				documentModel: dmTestInstance(),
				loadingState: "loaded"
			};

			const testDataHolder = setupDataHolderWithDocuments([doc]);

			const relevantInstances = [
				[
					{ elementName: "base", index: 1 },
					{ elementName: "aField", index: 1 }
				]
			];

			handleValidatePart()(
				testDataHolder,
				DataActions.validatePart({
					activityId: "test-activity",
					relevantInstances
				})
			);

			const callArgs = KernelFixtures.RtService.getCallArgs();

			notStrictEqual(callArgs.validatePart, undefined);
			strictEqual(callArgs.validatePart.length, 1);
			partialDeepStrictEqual(callArgs.validatePart[0], { document: doc.document });
			notStrictEqual(callArgs.validatePart[0].valuesOfFieldInstancesToConsider, undefined);
			strictEqual(
				(
					(callArgs.validatePart[0] as any).valuesOfFieldInstancesToConsider as Map<
						unknown,
						unknown
					>
				).size,
				0
			);
			partialDeepStrictEqual(callArgs.validatePart[0], {
				relevantEntityInstances: relevantInstances
			});
		});

		it("does not validate given element instances when they are notRelevant due to a dependency", () => {
			DocumentRuntimeServiceFactory.set(KernelFixtures.RtService.runtimeFactory({}));

			const doc: DgDocument = {
				docRef: "foo/1",
				document: {
					base: {
						aField: "bar",
						triggerField: "trigger",
						dependentField: 123,
						depGroup: {
							nestedField: 123
						}
					}
				},
				documentModel: dmTestInstance(),
				notRelevantConfigs: notRelevantConfigsTestInstance(),
				loadingState: "loaded"
			};

			const testDataHolder = setupDataHolderWithDocuments([doc]);

			const relevantInstances = [
				[
					{ elementName: "base", index: 1 },
					{ elementName: "aField", index: 1 }
				],
				[
					{ elementName: "base", index: 1 },
					{ elementName: "dependentField", index: 1 }
				],
				[
					{ elementName: "base", index: 1 },
					{ elementName: "depGroup", index: 1 },
					{ elementName: "nestedField", index: 1 }
				]
			];

			handleValidatePart()(
				testDataHolder,
				DataActions.validatePart({
					activityId: "test-activity",
					relevantInstances
				})
			);

			const callArgs = KernelFixtures.RtService.getCallArgs();

			notStrictEqual(callArgs.validatePart, undefined);
			strictEqual(callArgs.validatePart.length, 1);
			partialDeepStrictEqual(callArgs.validatePart[0], {
				document: {
					base: {
						aField: "bar",
						triggerField: "trigger"
					}
				}
			});
			partialDeepStrictEqual(callArgs.validatePart[0], {
				relevantEntityInstances: relevantInstances
			});
		});

		it("adds the new error messages to the validation state", () => {
			const errorField: EntityInstancePath = [
				{ elementName: "base", index: 1 },
				{ elementName: "aField", index: 1 }
			];

			const testMessage: Message = {
				...messageDefaults,
				entityInstance: errorField,
				errorCode: "foo",
				errorText: [],
				messageType: "VALUE_ERROR",
				referencedFields: [errorField],
				refOmissionErrorResponsible: [],
				rulePath: "fake-test-rule",
				severity: "ERROR"
			};

			DocumentRuntimeServiceFactory.set(
				KernelFixtures.RtService.runtimeFactory({
					validation: {
						noErrorOccurred: false,
						messages: [testMessage]
					}
				})
			);

			const doc: DgDocument = {
				docRef: "foo/1",
				document: {
					base: {
						aField: "bar"
					}
				},
				documentModel: dmTestInstance(),
				loadingState: "loaded"
			};

			const testDataHolder = setupDataHolderWithDocuments([doc]);

			const relevantInstances = [errorField];

			const newState = handleValidatePart()(
				testDataHolder,
				DataActions.validatePart({
					activityId: "test-activity",
					relevantInstances
				})
			);

			strictEqual(newState.data!.validation["foo/1"]!.messages[0], testMessage);
		});

		it("does not remove unknown data slices from the dataholder", () => {
			DocumentRuntimeServiceFactory.set(KernelFixtures.RtService.runtimeFactory({}));

			const doc: DgDocument = {
				docRef: "foo/1",
				document: {
					base: {
						aField: "bar"
					}
				},
				documentModel: dmTestInstance(),
				loadingState: "loaded"
			};

			const relevantInstances = [
				[
					{ elementName: "base", index: 1 },
					{ elementName: "aField", index: 1 }
				]
			];

			const standardDh = setupDataHolderWithDocuments([doc]);

			const unknownSlice = { foo: "bar" };
			const testDataHolder = {
				...standardDh,
				data: {
					...standardDh.data,
					unknownSlice
				}
			} as DgClAndValidationDataHolderShape;

			const updatedDh = handleValidatePart()(
				testDataHolder,
				DataActions.validatePart({
					activityId: "test-activity",
					relevantInstances
				})
			);

			partialDeepStrictEqual(updatedDh.data, { unknownSlice });
		});

		describe("kernel options", () => {
			function setupKernelOptionsTest(customOptions?: GeneratedCodeRtConfig) {
				const TEST_DOC: DgDocument = {
					docRef: "foo/1",
					document: {},
					documentModel: dmTestInstance(),
					loadingState: "loaded"
				};

				DocumentRuntimeServiceFactory.set(KernelFixtures.RtService.runtimeFactory({}));

				const testDh = setupDataHolderWithDocuments([TEST_DOC]);

				// reset calls from initializeDataComponent
				KernelFixtures.RtService.resetHistory();

				handleValidatePart(customOptions)(
					testDh,
					DataActions.validatePart({
						activityId: "test-activity",
						relevantInstances: []
					})
				);

				return KernelFixtures.RtService.getCallArgs();
			}

			it("hands the given kernel options to the runtime service", () => {
				const customKernelOptions: GeneratedCodeRtConfig = {
					customConditionFactory: { createCustomCondition: () => null }
				};

				const callArgs = setupKernelOptionsTest(customKernelOptions);

				strictEqual(callArgs.createDocumentRtService.length, 1);

				callArgs.createDocumentRtService.forEach(args => {
					deepStrictEqual(args.kernelOptions, {
						ignoreUnknownFields: true,
						...customKernelOptions
					});
				});
			});

			it("uses default options if no custom options are given", () => {
				const callArgs = setupKernelOptionsTest();

				strictEqual(callArgs.createDocumentRtService.length, 1);

				callArgs.createDocumentRtService.forEach(args => {
					deepStrictEqual(args.kernelOptions, { ignoreUnknownFields: true });
				});
			});
		});
	});
});

function setupDataHolderWithDocuments(documents: DgDocument[]): DgClAndValidationDataHolderShape {
	const descriptor: Activity.Descriptor = {
		instance: "test/1",
		model: "test-descriptor-model"
	};

	const entryPoint = documents.length ? documents[0].docRef : undefined;

	return {
		descriptor,
		loadingState: "loaded",
		savingState: "not_saved",
		dirty: false,
		slices: {},
		data: initializeDataComponent({ documents: documents, entryPoint })
	};
}

function dmTestInstance(): Model.DocumentAndValidationModel {
	return {
		header: {} as unknown as Model.DocumentAndValidationModel["header"],
		content: {
			modelConfig: {
				timeZone: "UTC"
			},
			modelInfo: {},
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
								id: "aField",
								name: "aField",
								fieldType: {
									type: "StringType"
								},
								type: "Field"
							},
							{
								id: "triggerField",
								name: "triggerField",
								fieldType: {
									type: "EnumerationType",
									values: [{ value: "trigger" }, { value: "dontTrigger" }]
								},
								type: "Field"
							},
							{
								id: "dependentField",
								name: "dependentField",
								fieldType: {
									type: "NumberType"
								},
								type: "Field"
							},
							{
								id: "depGroup",
								name: "depGroup",
								type: "Group",
								elements: [
									{
										id: "nestedField",
										name: "nestedField",
										fieldType: {
											type: "NumberType"
										},
										type: "Field"
									}
								],
								repeatability: 1
							}
						]
					}
				]
			},
			documentUniquenessCriteria: []
		},
		generatedCodeAccessor: {
			getCalculator() {},
			getMetaModel() {},
			getValidator() {}
		}
	};
}

function notRelevantConfigsTestInstance(): NotRelevantConfig[] {
	function createConfigEntry(
		fieldPath: ModelPath,
		value: FieldInstanceValue
	): NotRelevantConfigEntry {
		return {
			cases: [
				{
					conditions: [
						{
							fieldPath,
							value
						}
					]
				}
			]
		};
	}

	return [
		{
			["/base/dependentField"]: createConfigEntry(
				[{ elementName: "base" }, { elementName: "triggerField" }],
				"trigger"
			),
			["/base/depGroup"]: createConfigEntry(
				[{ elementName: "base" }, { elementName: "triggerField" }],
				"trigger"
			)
		}
	];
}
