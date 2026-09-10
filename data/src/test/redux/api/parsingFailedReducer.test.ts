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
import { DocumentServiceFactory } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/facade.js";

import { initializeDataComponent } from "../../../core/api/initializeDataComponent.js";
import { DocumentPath } from "../../../core/api/path/documentPath.js";
import { DocServiceFactory } from "../../../data-mutation/validation-computation/docServiceFactory.js";
import type {
	ParseError,
	ValidationData
} from "../../../data-mutation/validation-computation/types.js";
import { DocumentRuntimeServiceFactory } from "../../../data-mutation/validation-computation/validationRuntimeService.js";
import { ValidatorProviderFactory } from "../../../data-mutation/validation-computation/validatorProviderFactory.js";
import { handleParsingFailed } from "../../../data-mutation/values/handleParsingFailed.js";
import type { DgDocument } from "../../../internal/documentGraph.js";
import { DataActions } from "../../../redux/api/actions.js";
import type { DgClAndValidationDataHolderShape } from "../../../redux/api/types.js";
import { assertCondition } from "../../../typeguards.js";
import { KernelFixtures } from "../../setup/testValidationRuntime.js";

import { message } from "./mocks/mockMessage.js";

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
		DocServiceFactory.set(new DocumentServiceFactory());
		KernelFixtures.DocService.resetHistory();
		KernelFixtures.RtService.resetHistory();
		ValidatorProviderFactory.set({
			getValidatorProvider: dm => dm.generatedCodeAccessor
		});
	});

	describe("handleParsingFailed", () => {
		it("resets the field instance in the entry point document and sets the dirty flag to true", () => {
			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF = "/base[1]/aGroup[1]/aField[1]";

			const TEST_DOC: DgDocument = {
				docRef: "foo/1",
				document: {
					base: {
						aGroup: {
							aField: "bar"
						}
					}
				},
				documentModel: emptyDmTestInstance(),
				loadingState: "loaded"
			};

			DocumentRuntimeServiceFactory.set(KernelFixtures.RtService.runtimeFactory({}));
			DocServiceFactory.set(
				KernelFixtures.DocService.instance({
					getByPath: {
						id: "aField-id",
						name: "aField",
						fieldType: {
							type: "StringType"
						},
						type: "Field"
					},
					updateEntityInstance: {
						base: {
							aGroup: {
								aField: null
							}
						}
					}
				})
			);

			const testDh = setupDataHolderWithDocuments([TEST_DOC]);

			const TEST_DATA_REF_PATH = DocumentPath.fromString(TEST_DATA_REF);

			const updatedDh = handleParsingFailed()(
				testDh,
				DataActions.parsingFailed({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF,
					parseError: {
						message: message({ type: "parseError", entityInstance: TEST_DATA_REF_PATH }),
						value: "this-is-blatantly-wrong!"
					}
				})
			);

			const callArgs = KernelFixtures.DocService.getCallArgs();

			// check update entity instance call
			notStrictEqual(callArgs.updateEntityInstance, undefined);
			strictEqual(callArgs.updateEntityInstance.length, 1);
			partialDeepStrictEqual(callArgs.updateEntityInstance[0], { document: TEST_DOC.document });
			partialDeepStrictEqual(callArgs.updateEntityInstance[0], { path: TEST_DATA_REF_PATH });
			partialDeepStrictEqual(callArgs.updateEntityInstance[0], { update: null });

			// check correctly updated data holder
			const updatedDoc =
				updatedDh.data?.documentGraph.documents.byDocRef[updatedDh.data.entryPoint ?? ""];
			assertCondition(updatedDoc?.loadingState === "loaded");

			strictEqual((updatedDoc.document as any).base.aGroup.aField, null);

			strictEqual(updatedDh.dirty, true);
		});

		it("does not set the dirty flag to true if neither the document nor the error values changed", () => {
			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF = "/base[1]/aGroup[1]/aField[1]";
			const TEST_VALUE = "this-is-blatantly-wrong!";

			const TEST_DOC: DgDocument = {
				docRef: "foo/1",
				document: {
					base: {
						aGroup: {
							aField: null
						}
					}
				},
				documentModel: emptyDmTestInstance(),
				loadingState: "loaded"
			};

			DocumentRuntimeServiceFactory.set(KernelFixtures.RtService.runtimeFactory({}));
			DocServiceFactory.set(
				KernelFixtures.DocService.instance({
					getByPath: {
						id: "aField-id",
						name: "aField",
						fieldType: {
							type: "StringType"
						},
						type: "Field"
					},
					getAssignedObject: null,
					updateEntityInstance: {
						base: {
							aGroup: {
								aField: null
							}
						}
					}
				})
			);

			const testDh = setupDataHolderWithDocuments([TEST_DOC], {
				[TEST_DOC.docRef]: { messages: [], errorValues: { [TEST_DATA_REF]: TEST_VALUE } }
			});

			const TEST_DATA_REF_PATH = DocumentPath.fromString(TEST_DATA_REF);

			const EXPECTED_MESSAGE = message({ type: "parseError", entityInstance: TEST_DATA_REF_PATH });

			const updatedDh = handleParsingFailed()(
				testDh,
				DataActions.parsingFailed({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF,
					parseError: {
						message: EXPECTED_MESSAGE,
						value: TEST_VALUE
					}
				})
			);

			deepStrictEqual(updatedDh.data?.validation[TEST_DOC.docRef], {
				messages: [EXPECTED_MESSAGE],
				errorValues: { [TEST_DATA_REF]: TEST_VALUE }
			});
			strictEqual(updatedDh.dirty, false);
		});

		it("updates the message state", () => {
			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF = "/base[1]/aGroup[1]/aField[1]";

			const TEST_DOC: DgDocument = {
				docRef: "foo/1",
				document: {
					base: {
						aGroup: {
							aField: null // important to ensure that this works even if the document doesn't change
						}
					}
				},
				documentModel: emptyDmTestInstance(),
				loadingState: "loaded"
			};

			DocumentRuntimeServiceFactory.set(KernelFixtures.RtService.runtimeFactory({}));
			DocServiceFactory.set(
				KernelFixtures.DocService.instance({
					getByPath: {
						id: "aField-id",
						name: "aField",
						fieldType: {
							type: "StringType"
						},
						type: "Field"
					},
					updateEntityInstance: {
						base: {
							aGroup: {
								aField: null
							}
						}
					}
				})
			);

			const testDh = setupDataHolderWithDocuments([TEST_DOC], {
				[TEST_DOC.docRef]: {
					messages: [
						message({ type: "ruleError", entityInstance: DocumentPath.fromString(TEST_DATA_REF) })
					],
					errorValues: {}
				}
			});

			const TEST_DATA_REF_PATH = DocumentPath.fromString(TEST_DATA_REF);
			const ERROR_VALUE = "this-is-blatantly-wrong!";

			const EXPECTED_ERROR: ParseError = {
				message: message({ type: "parseError", entityInstance: TEST_DATA_REF_PATH }),
				value: ERROR_VALUE
			};

			const updatedDh = handleParsingFailed()(
				testDh,
				DataActions.parsingFailed({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF,
					parseError: EXPECTED_ERROR
				})
			);

			notStrictEqual(updatedDh.data?.validation["foo/1"], undefined);
			strictEqual(updatedDh.data?.validation["foo/1"]?.messages[0], EXPECTED_ERROR.message);
			strictEqual(updatedDh.data?.validation["foo/1"]?.errorValues[TEST_DATA_REF], ERROR_VALUE);
			strictEqual(updatedDh.data?.validation["foo/1"]?.messages.length, 1);
		});

		it("does not remove unknown data slices from the dataholder", () => {
			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF = "/base[1]/aGroup[1]/aField[1]";

			const TEST_DOC: DgDocument = {
				docRef: "foo/1",
				document: {
					base: {
						aGroup: {
							aField: "bar"
						}
					}
				},
				documentModel: emptyDmTestInstance(),
				loadingState: "loaded"
			};

			DocumentRuntimeServiceFactory.set(KernelFixtures.RtService.runtimeFactory({}));
			DocServiceFactory.set(
				KernelFixtures.DocService.instance({
					getByPath: {
						id: "aField-id",
						name: "aField",
						fieldType: {
							type: "StringType"
						},
						type: "Field"
					},
					updateEntityInstance: {
						base: {
							aGroup: {
								aField: null
							}
						}
					}
				})
			);

			const TEST_DATA_REF_PATH = DocumentPath.fromString(TEST_DATA_REF);

			const standardDh = setupDataHolderWithDocuments([TEST_DOC]);

			const unknownSlice = { foo: "bar" };
			const testDh = {
				...standardDh,
				data: {
					...standardDh.data,
					unknownSlice
				}
			} as DgClAndValidationDataHolderShape;

			const updatedDh = handleParsingFailed()(
				testDh,
				DataActions.parsingFailed({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF,
					parseError: {
						message: message({
							type: "parseError",
							entityInstance: TEST_DATA_REF_PATH
						}),
						value: "this-is-blatantly-wrong!"
					}
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

function emptyDmTestInstance(): Model.DocumentAndValidationModel {
	return {
		header: {} as unknown as Model.DocumentAndValidationModel["header"],
		content: {} as unknown as Model.DocumentAndValidationModel["content"],
		generatedCodeAccessor: {
			getCalculator() {},
			getMetaModel() {},
			getValidator() {}
		}
	};
}
