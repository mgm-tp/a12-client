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

import type { Activity, Model } from "@com.mgmtp.a12.client/client-core";
import { DocumentRtServiceFactoryA12internal } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/a12internal/compute.js";
import type {
	ComputedFieldInstance,
	Document,
	Message
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";
import { DocumentServiceFactory } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/facade.js";

import { initializeDataComponent } from "../../../core/api/initializeDataComponent.js";
import type { FormModel } from "../../../core/api/model/form-model.js";
import { DocServiceFactory } from "../../../data-mutation/validation-computation/docServiceFactory.js";
import type { ValidationData } from "../../../data-mutation/validation-computation/types.js";
import { DocumentRuntimeServiceFactory } from "../../../data-mutation/validation-computation/validationRuntimeService.js";
import { ValidatorProviderFactory } from "../../../data-mutation/validation-computation/validatorProviderFactory.js";
import { handleRowAdded } from "../../../data-mutation/values/handleRowAdded.js";
import type { DgDocument } from "../../../internal/documentGraph.js";
import { DataActions } from "../../../redux/api/actions.js";
import type { DgClAndValidationDataHolderShape } from "../../../redux/api/types.js";
import { assertCondition } from "../../../typeguards.js";
import { KernelFixtures } from "../../setup/testValidationRuntime.js";

describe("redux.api.reducers", () => {
	beforeEach(() => {
		ValidatorProviderFactory.set(
			KernelFixtures.ValidatorProvider.instance({
				metaFields: []
			})
		);
		DocumentRuntimeServiceFactory.set(KernelFixtures.RtService.runtimeFactory({}));
	});
	afterEach(() => {
		DocumentRuntimeServiceFactory.set(DocumentRtServiceFactoryA12internal);
		DocServiceFactory.set(new DocumentServiceFactory());
		KernelFixtures.DocService.resetHistory();
		KernelFixtures.RtService.resetHistory();
		ValidatorProviderFactory.set({
			getValidatorProvider: dm => dm.generatedCodeAccessor
		});
	});

	describe("handleRowAdded", () => {
		it("adds the new group instance to the entry point document and sets the dirty flag to true", () => {
			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF = "/base[1]/aGroup[0]";

			const TEST_DOC: DgDocument = {
				docRef: "foo/1",
				document: {
					base: {}
				},
				documentModel: dmTestInstance(),
				loadingState: "loaded"
			};

			// round 1

			const testDh = setupDataHolderWithDocuments([TEST_DOC]);
			const updatedDh = handleRowAdded()(
				testDh,
				DataActions.rowAdded({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF
				})
			);

			// check correctly updated data holder
			const updatedDoc =
				updatedDh.data?.documentGraph.documents.byDocRef[updatedDh.data.entryPoint ?? ""];
			assertCondition(updatedDoc?.loadingState === "loaded");

			deepStrictEqual(updatedDoc.document, {
				base: {
					aGroup: [{}]
				}
			});

			// round 2 - 2nd row added

			const againUpdatedDh = handleRowAdded()(
				updatedDh,
				DataActions.rowAdded({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF
				})
			);

			// check correctly updated data holder
			const againUpdatedDoc =
				againUpdatedDh.data?.documentGraph.documents.byDocRef[againUpdatedDh.data.entryPoint ?? ""];
			assertCondition(againUpdatedDoc?.loadingState === "loaded");

			deepStrictEqual(againUpdatedDoc.document, {
				base: {
					aGroup: [{}, {}]
				}
			});

			strictEqual(updatedDh.dirty, true);
		});

		it("applies all initial values for the new group instance", () => {
			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF = "/base[1]/aGroup[0]";

			const TEST_DOC: DgDocument = {
				docRef: "foo/1",
				document: {
					base: {}
				},
				documentModel: dmTestInstance(),
				formModel: fmTestInstance(),
				loadingState: "loaded"
			};

			const testDh = setupDataHolderWithDocuments([TEST_DOC]);
			const updatedDh = handleRowAdded()(
				testDh,
				DataActions.rowAdded({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF
				})
			);

			// check correctly updated data holder
			const updatedDoc =
				updatedDh.data?.documentGraph.documents.byDocRef[updatedDh.data.entryPoint ?? ""];
			assertCondition(updatedDoc?.loadingState === "loaded");

			deepStrictEqual(updatedDoc.document, {
				base: {
					aGroup: [
						{
							aField: "abc"
						}
					]
				}
			});
		});

		it("re-computes the document after adding the new group instance", () => {
			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF = "/base[1]/aGroup[0]";

			const TEST_DOC: DgDocument = {
				docRef: "foo/1",
				document: {
					base: {}
				},
				documentModel: dmTestInstance(),
				loadingState: "loaded"
			};

			const computedDoc: Document = {
				base: {
					aGroup: [{ anotherField: 123 }]
				}
			};
			const computedFieldInstance: ComputedFieldInstance = {
				path: [
					{ elementName: "base", index: 1 },
					{ elementName: "aGroup", index: 1 },
					{ elementName: "anotherField", index: 1 }
				],
				document: computedDoc,
				stringValue: "123",
				value: 123,
				errorMessage: undefined
			};

			const testDh = setupDataHolderWithDocuments([TEST_DOC]);

			// reset history to ignore initial computation
			KernelFixtures.RtService.resetHistory();

			DocumentRuntimeServiceFactory.set(
				KernelFixtures.RtService.runtimeFactory({
					computation: {
						appliedTo: () => computedDoc,
						clearedFieldInstances: [],
						computedFieldInstances: [computedFieldInstance],
						computedFieldInstancesWithChanges: [computedFieldInstance],
						computedFieldInstancesWithErrors: [],
						computedFieldInstancesWithoutErrors: [computedFieldInstance],
						document: computedDoc,
						formalErrorsInOperands: [],
						noErrorOccurred: true
					}
				})
			);

			handleRowAdded()(
				testDh,
				DataActions.rowAdded({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF
				})
			);

			const callArgs = KernelFixtures.RtService.getCallArgs();

			// check recomputation
			notStrictEqual(callArgs.computeA12internal, undefined);
			strictEqual(callArgs.computeA12internal.length, 1);
			partialDeepStrictEqual(callArgs.computeA12internal[0], {
				document: {
					base: {
						aGroup: [{}]
					}
				}
			});
		});

		it("validates the document and updates the message state", () => {
			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF = "/base[1]/aGroup[0]";

			const TEST_DOC: DgDocument = {
				docRef: "foo/1",
				document: {
					base: {}
				},
				documentModel: dmTestInstance(),
				loadingState: "loaded"
			};

			const errorFieldPath = [
				{ elementName: "base", index: 1 },
				{ elementName: "aGroup", index: 1 },
				{ elementName: "anotherField", index: 1 }
			];
			const preparedMessage: Message = {
				entityInstance: errorFieldPath,
				errorCode: "123",
				errorText: [],
				messageType: "VALUE_ERROR",
				referencedFields: [errorFieldPath],
				refOmissionErrorResponsible: [],
				rulePath: "path/to/test/rule",
				severity: "ERROR"
			};

			DocumentRuntimeServiceFactory.set(
				KernelFixtures.RtService.runtimeFactory({
					validation: {
						messages: [preparedMessage],
						noErrorOccurred: false
					}
				})
			);

			const testDh = setupDataHolderWithDocuments([TEST_DOC]);
			const updatedDh = handleRowAdded()(
				testDh,
				DataActions.rowAdded({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF
				})
			);

			const callArgs = KernelFixtures.RtService.getCallArgs();

			// check revalidation
			notStrictEqual(callArgs.validatePart, undefined);
			strictEqual(callArgs.validatePart.length, 1);

			strictEqual(updatedDh.data?.validation["foo/1"]?.messages[0], preparedMessage);
		});

		it("does not remove unknown data slices from the dataholder", () => {
			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF = "/base[1]/aGroup[0]";

			const TEST_DOC: DgDocument = {
				docRef: "foo/1",
				document: {
					base: {}
				},
				documentModel: dmTestInstance(),
				formModel: fmTestInstance(),
				loadingState: "loaded"
			};

			const standardDh = setupDataHolderWithDocuments([TEST_DOC]);

			const unknownSlice = { foo: "bar" };
			const testDh = {
				...standardDh,
				data: {
					...standardDh.data,
					unknownSlice
				}
			} as DgClAndValidationDataHolderShape;

			const updatedDh = handleRowAdded()(
				testDh,
				DataActions.rowAdded({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF
				})
			);

			partialDeepStrictEqual(updatedDh.data, { unknownSlice });
		});
	});
});

function setupDataHolderWithDocuments(
	documents: DgDocument[],
	validation?: ValidationData
): DgClAndValidationDataHolderShape {
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
		data: {
			...initializeDataComponent(documents, [], entryPoint),
			validation: validation ?? {}
		}
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
								id: "aGroup",
								type: "Group",
								repeatability: 10,
								name: "aGroup",
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
										id: "anotherField",
										name: "anotherField",
										fieldType: {
											type: "NumberType"
										},
										type: "Field"
									}
								]
							}
						]
					}
				]
			}
		},
		generatedCodeAccessor: {
			getCalculator() {},
			getMetaModel() {},
			getValidator() {}
		}
	};
}

function fmTestInstance(): FormModel {
	return {
		header: {} as unknown as FormModel["header"],
		content: {
			screens: [],
			defaults: {},
			footerBox: {
				id: "footer"
			},
			subHeaderBox: {
				id: "subheader"
			},
			fieldConfiguration: {
				fieldMap: {},
				field: [
					{
						elementRef: "-empty-",
						elementPath: [
							{ elementName: "base" },
							{ elementName: "aGroup" },
							{ elementName: "aField" }
						],
						initialValue: "abc",
						initialValueTyped: "abc"
					}
				]
			},
			groupConfiguration: {
				groupMap: {}
			}
		}
	};
}
