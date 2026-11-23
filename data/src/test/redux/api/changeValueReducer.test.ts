// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import {
	deepStrictEqual,
	notStrictEqual,
	ok,
	partialDeepStrictEqual,
	strictEqual
} from "node:assert/strict";

import type { Activity, Model } from "@com.mgmtp.a12.client/client-core";
import { DocumentRtServiceFactoryA12internal } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/a12internal/compute.js";
import type {
	ComputedFieldInstance,
	EntityInstancePath,
	Message
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";
import { DocumentServiceFactory } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/facade.js";

import { initializeDataComponent } from "../../../core/api/initializeDataComponent.js";
import type { FormModel } from "../../../core/api/model/form-model.js";
import type { NotRelevantConfig } from "../../../core/api/model/relevance/notRelevantConfig.js";
import { DocumentPath } from "../../../core/api/path/documentPath.js";
import type { KernelTypes } from "../../../data-mutation/types.js";
import { DocServiceFactory } from "../../../data-mutation/validation-computation/docServiceFactory.js";
import { KernelMessage } from "../../../data-mutation/validation-computation/message.js";
import type { ValidationData } from "../../../data-mutation/validation-computation/types.js";
import { DocumentRuntimeServiceFactory } from "../../../data-mutation/validation-computation/validationRuntimeService.js";
import { ValidatorProviderFactory } from "../../../data-mutation/validation-computation/validatorProviderFactory.js";
import { handleChangeValue } from "../../../data-mutation/values/handleChangeValue.js";
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

	/*
     TODO:
     * - remove computation errors for recomputed (now valid) fields
     * - keep parse errors & computation errors for unchanged fields
     */

	describe("handleChangeValue", () => {
		it("updates the field instance in the entry point document and sets the dirty flag to true", () => {
			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF = "/base[1]/aGroup[1]/aField[1]";
			const TEST_VALUE = "baz";

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
								aField: TEST_VALUE
							}
						}
					}
				})
			);

			const testDh = setupDataHolderWithDocuments([TEST_DOC]);

			const updatedDh = handleChangeValue()(
				testDh,
				DataActions.changeValue({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF,
					value: TEST_VALUE,
					userValue: TEST_VALUE
				})
			);

			const callArgs = KernelFixtures.DocService.getCallArgs();

			// check update entity instance call
			notStrictEqual(callArgs.updateEntityInstance, undefined);
			// there will be two calls:
			// 1. a call to construct a document just for the field constraints check
			// 2. the call that updates the actual document if the field constraint check was successful
			strictEqual(callArgs.updateEntityInstance.length, 2);
			partialDeepStrictEqual(callArgs.updateEntityInstance[1], { document: TEST_DOC.document });
			partialDeepStrictEqual(callArgs.updateEntityInstance[1], {
				path: DocumentPath.fromString(TEST_DATA_REF)
			});
			partialDeepStrictEqual(callArgs.updateEntityInstance[1], { update: TEST_VALUE });

			// check correctly updated data holder
			const updatedDoc =
				updatedDh.data?.documentGraph.documents.byDocRef[updatedDh.data.entryPoint ?? ""];
			assertCondition(updatedDoc?.loadingState === "loaded");

			strictEqual((updatedDoc.document as any).base.aGroup.aField, TEST_VALUE);

			strictEqual(updatedDh.dirty, true);
		});

		it("updates the group instance in the entry point document and sets the dirty flag to true", () => {
			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF = "/base[1]/aRepeatableGroup[1]";
			const TEST_VALUE = undefined;

			const VALUE_BEFORE_CHANGE = {
				aField: "bar"
			};

			const TEST_DOC: DgDocument = {
				docRef: "foo/1",
				document: {
					base: {
						aRepeatableGroup: [
							VALUE_BEFORE_CHANGE,
							{
								aField: "baz"
							}
						]
					}
				},
				documentModel: emptyDmTestInstance(),
				loadingState: "loaded"
			};

			const TEST_DOC_AFTER_CHANGE = {
				aRepeatableGroup: [
					{
						aField: "baz"
					}
				]
			};

			DocServiceFactory.set(
				KernelFixtures.DocService.instance({
					getByPath: {
						id: "aRepeatableGroup-id",
						name: "aRepeatableGroup",
						repeatability: 5,
						type: "Group",
						elements: []
					},
					updateEntityInstance: TEST_DOC_AFTER_CHANGE,
					getAssignedObject: VALUE_BEFORE_CHANGE
				})
			);

			const testDh = setupDataHolderWithDocuments([TEST_DOC]);

			const updatedDh = handleChangeValue()(
				testDh,
				DataActions.changeValue({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF,
					value: TEST_VALUE,
					userValue: TEST_VALUE
				})
			);

			const callArgs = KernelFixtures.DocService.getCallArgs();

			// check update entity instance call
			notStrictEqual(callArgs.updateEntityInstance, undefined);
			strictEqual(callArgs.updateEntityInstance.length, 1);
			partialDeepStrictEqual(callArgs.updateEntityInstance[0], { document: TEST_DOC.document });
			partialDeepStrictEqual(callArgs.updateEntityInstance[0], {
				path: DocumentPath.fromString(TEST_DATA_REF)
			});
			partialDeepStrictEqual(callArgs.updateEntityInstance[0], { update: TEST_VALUE });

			// check correctly updated data holder
			const updatedDoc =
				updatedDh.data?.documentGraph.documents.byDocRef[updatedDh.data.entryPoint ?? ""];
			assertCondition(updatedDoc?.loadingState === "loaded");

			strictEqual(updatedDoc.document, TEST_DOC_AFTER_CHANGE);

			strictEqual(updatedDh.dirty, true);
		});

		it("returns the given data holder when new value and old value are identical", () => {
			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF = "/base[1]/aGroup[1]/aField[1]";
			const TEST_VALUE = "bar";

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

			const testDh = setupDataHolderWithDocuments([TEST_DOC]);

			const updatedDh = handleChangeValue()(
				testDh,
				DataActions.changeValue({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF,
					value: TEST_VALUE,
					userValue: TEST_VALUE
				})
			);

			strictEqual(updatedDh, testDh);
		});

		it("removes the parseError when a formally incorrect field value was removed", () => {
			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF = "/base[1]/aGroup[1]/aField[1]";

			const TEST_DOC: DgDocument = {
				docRef: "foo/1",
				document: {
					base: {
						aGroup: {
							aField: undefined
						}
					}
				},
				documentModel: emptyDmTestInstance(),
				loadingState: "loaded"
			};

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
								aField: undefined
							}
						}
					},
					getAssignedObject: undefined
				})
			);

			const testDh = setupDataHolderWithDocuments([TEST_DOC], {
				"foo/1": {
					errorValues: {
						"/base[1]/aGroup[1]/aField[1]": "formally invalid value"
					},
					messages: [
						message({ type: "parseError", entityInstance: DocumentPath.fromString(TEST_DATA_REF) })
					]
				}
			});

			const updatedDh = handleChangeValue()(
				testDh,
				DataActions.changeValue({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF,
					value: undefined,
					userValue: undefined
				})
			);

			deepStrictEqual(updatedDh.data?.validation, {
				"foo/1": { errorValues: {}, messages: [] }
			});
		});

		it("validates the new value", () => {
			DocServiceFactory.set(
				KernelFixtures.DocService.instance({
					getByPath: {
						id: "aField-id",
						name: "aField",
						fieldType: {
							type: "StringType"
						},
						type: "Field"
					}
				})
			);

			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF = "/base[1]/aGroup[1]/aField[1]";
			const TEST_VALUE = "baz";

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

			const testDh = setupDataHolderWithDocuments([TEST_DOC]);

			handleChangeValue()(
				testDh,
				DataActions.changeValue({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF,
					value: TEST_VALUE,
					userValue: TEST_VALUE
				})
			);

			const callArgs = KernelFixtures.RtService.getCallArgs();

			notStrictEqual(callArgs.validatePart, undefined);
			// there should be two calls:
			// 1. "formal error check" for the initially changed field only
			// 2. "validate whole change set" - initially changed field + all recomputed fields
			strictEqual(callArgs.validatePart.length, 2);

			notStrictEqual(callArgs.validatePart[0].document, undefined);
			notStrictEqual(callArgs.validatePart[0].relevantEntityInstances, undefined);
			const relevantEntities1stCall: EntityInstancePath[] = (callArgs.validatePart[0] as any)
				.relevantEntityInstances;
			strictEqual(relevantEntities1stCall.length, 1);
			deepStrictEqual(relevantEntities1stCall[0], DocumentPath.fromString(TEST_DATA_REF));

			notStrictEqual(callArgs.validatePart[1].document, undefined);
			notStrictEqual(callArgs.validatePart[1].relevantEntityInstances, undefined);
			const relevantEntities2ndCall: EntityInstancePath[] = (callArgs.validatePart[1] as any)
				.relevantEntityInstances;
			strictEqual(relevantEntities2ndCall.length, 1);
			deepStrictEqual(relevantEntities2ndCall[0], DocumentPath.fromString(TEST_DATA_REF));
		});

		it("updates the message state", () => {
			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF = "/base[1]/aGroup[1]/aField[1]";
			const TEST_VALUE = "baz";

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

			const ERROR = message({
				type: "parseError",
				entityInstance: DocumentPath.fromString(TEST_DATA_REF)
			});

			DocumentRuntimeServiceFactory.set(
				KernelFixtures.RtService.runtimeFactory({
					validation: {
						noErrorOccurred: false,
						messages: [ERROR]
					}
				})
			);
			DocServiceFactory.set(
				KernelFixtures.DocService.instance({
					getByPath: {
						id: "aField-id",
						name: "aField",
						fieldType: {
							type: "StringType"
						},
						type: "Field"
					}
				})
			);

			const testDh = setupDataHolderWithDocuments([TEST_DOC]);

			const updatedDh = handleChangeValue()(
				testDh,
				DataActions.changeValue({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF,
					value: TEST_VALUE,
					userValue: TEST_VALUE
				})
			);

			notStrictEqual(updatedDh.data?.validation["foo/1"], undefined);
			partialDeepStrictEqual(updatedDh.data?.validation["foo/1"]?.messages, [ERROR]);
		});

		it("recomputes and extends the field value update with the recomputed values", () => {
			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF_VALUE_CHANGED = "/base[1]/aGroup[1]/aField[1]";
			const TEST_DATA_REF_VALUE_RECOMPUTED = "/base[1]/aGroup[1]/bField[1]";
			const TEST_DATA_REF_VALUE_CLEARED = "/base[1]/aGroup[1]/cField[1]";

			const TEST_VALUE = "baz";

			const TEST_DG_DOC: DgDocument = {
				docRef: "foo/1",
				document: {
					// initial document
					base: {
						aGroup: {
							aField: "bar",
							cField: "some-value"
						}
					}
				},
				documentModel: emptyDmTestInstance(),
				loadingState: "loaded"
			};

			// after initial value change
			const TEST_DOC_BEFORE_COMP = {
				base: {
					aGroup: {
						aField: "baz",
						cField: "some-value"
					}
				}
			};

			// after recomputation
			const TEST_DOC_AFTER_COMP = {
				base: {
					aGroup: {
						aField: "baz",
						bField: "computed-value"
						// cField was cleared!
					}
				}
			};

			const computedFieldInstance: ComputedFieldInstance = {
				document: TEST_DOC_AFTER_COMP,
				path: [
					{ elementName: "base", index: 1 },
					{ elementName: "aGroup", index: 1 },
					{ elementName: "bField", index: 1 }
				],
				errorMessage: undefined,
				value: "computed-value",
				stringValue: "computed-value"
			};

			const clearedFieldInstance: ComputedFieldInstance = {
				document: TEST_DOC_AFTER_COMP,
				path: [
					{ elementName: "base", index: 1 },
					{ elementName: "aGroup", index: 1 },
					{ elementName: "cField", index: 1 }
				],
				errorMessage: undefined,
				value: "",
				stringValue: undefined
			};

			const testDh = setupDataHolderWithDocuments([TEST_DG_DOC]);

			// reset history to ignore initial computation
			KernelFixtures.RtService.resetHistory();

			DocumentRuntimeServiceFactory.set(
				KernelFixtures.RtService.runtimeFactory({
					computation: {
						appliedTo: doc => TEST_DOC_AFTER_COMP,
						// oxlint-disable-next-line typescript/no-deprecated -- kernel 30 declares this field required, and removes it in 31
						computedFieldInstances: [computedFieldInstance, clearedFieldInstance],
						computedFieldInstancesWithChanges: [computedFieldInstance],
						computedFieldInstancesWithErrors: [],
						computedFieldInstancesWithoutErrors: [computedFieldInstance],
						clearedFieldInstances: [clearedFieldInstance],
						document: TEST_DOC_AFTER_COMP,
						formalErrorsInOperands: [],
						noErrorOccurred: true
					}
				})
			);

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
					updateEntityInstance: TEST_DOC_BEFORE_COMP
				})
			);

			const updatedDh = handleChangeValue()(
				testDh,
				DataActions.changeValue({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF_VALUE_CHANGED,
					value: TEST_VALUE,
					userValue: TEST_VALUE
				})
			);

			const callArgs = KernelFixtures.RtService.getCallArgs();

			// check recomputation
			notStrictEqual(callArgs.computeA12internal, undefined);
			strictEqual(callArgs.computeA12internal.length, 1);
			partialDeepStrictEqual(callArgs.computeA12internal[0], { document: TEST_DOC_BEFORE_COMP });

			// check revalidation
			notStrictEqual(callArgs.validatePart, undefined);
			strictEqual(callArgs.validatePart.length, 2);
			partialDeepStrictEqual(callArgs.validatePart[1], { document: TEST_DOC_AFTER_COMP });

			notStrictEqual(callArgs.validatePart[1].relevantEntityInstances, undefined);
			const relevantEntities: EntityInstancePath[] = (callArgs.validatePart[1] as any)
				.relevantEntityInstances;
			strictEqual(relevantEntities.length, 3);
			partialDeepStrictEqual(relevantEntities, [
				DocumentPath.fromString(TEST_DATA_REF_VALUE_CHANGED)
			]);
			partialDeepStrictEqual(relevantEntities, [
				DocumentPath.fromString(TEST_DATA_REF_VALUE_RECOMPUTED)
			]);
			partialDeepStrictEqual(relevantEntities, [
				DocumentPath.fromString(TEST_DATA_REF_VALUE_CLEARED)
			]);

			// check correctly updated data holder
			const updatedDoc =
				updatedDh.data?.documentGraph.documents.byDocRef[updatedDh.data.entryPoint ?? ""];
			assertCondition(updatedDoc?.loadingState === "loaded");

			strictEqual(updatedDoc.document, TEST_DOC_AFTER_COMP);
		});

		it("does not pass a multi-select change as a trigger to the external computations", () => {
			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF_VALUE_CHANGED = "/base[1]/multiSelect[0]";

			const TEST_VALUE = [{ value: "a" }, { value: "b" }, { value: "c" }];

			const TEST_DG_DOC: DgDocument = {
				docRef: "foo/1",
				document: {
					// initial document
					base: {
						multiSelect: [
							{
								value: "c"
							}
						]
					}
				},
				documentModel: dmMultiSelectTestInstance(),
				loadingState: "loaded"
			};

			// after recomputation
			const TEST_DOC_AFTER_CHANGE = {
				base: {
					multiSelect: [
						{
							value: "a"
						},
						{
							value: "b"
						},
						{
							value: "c"
						}
					]
				}
			};

			const testDh = setupDataHolderWithDocuments([TEST_DG_DOC]);

			// reset history to ignore initial computation
			KernelFixtures.RtService.resetHistory();

			DocServiceFactory.set(
				KernelFixtures.DocService.instance({
					getByPath: {
						id: "multiSelect",
						name: "multiSelect",
						type: "Group",
						usageType: "multi-select",
						repeatability: 3,
						elements: []
					},
					updateEntityInstance: TEST_DOC_AFTER_CHANGE
				})
			);

			handleChangeValue()(
				testDh,
				DataActions.changeValue({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF_VALUE_CHANGED,
					value: TEST_VALUE,
					userValue: undefined
				})
			);

			const callArgs = KernelFixtures.RtService.getCallArgs();

			// check that external computation is called without explicit trigger
			notStrictEqual(callArgs.computeA12internal, undefined);
			strictEqual(callArgs.computeA12internal.length, 1);
			partialDeepStrictEqual(callArgs.computeA12internal[0], { document: TEST_DOC_AFTER_CHANGE });
			strictEqual((callArgs.computeA12internal[0] as any).changedFieldInstances, undefined);
		});

		it("applies the dependencies from the FormModel during recomputation", () => {
			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF_VALUE_CHANGED = "/base[1]/aGroup[1]/aField[1]";
			const TEST_VALUE = "baz";

			const TEST_DG_DOC: DgDocument = {
				docRef: "foo/1",
				document: {
					// initial document
					base: {
						aGroup: {
							aField: "bar"
						}
					}
				},
				documentModel: emptyDmTestInstance(),
				formModel: fmTestInstance(),
				notRelevantConfigs: notRelevantConfigsTestInstance(),
				loadingState: "loaded"
			};

			const TEST_DOC_AFTER_CHANGE = {
				base: {
					aGroup: {
						aField: "baz"
					}
				}
			};

			const testDh = setupDataHolderWithDocuments([TEST_DG_DOC]);

			// reset history to ignore initial computation
			KernelFixtures.RtService.resetHistory();

			DocumentRuntimeServiceFactory.set(
				KernelFixtures.RtService.runtimeFactory({
					computation: {
						appliedTo: doc => TEST_DOC_AFTER_CHANGE,
						// oxlint-disable-next-line typescript/no-deprecated -- kernel 30 declares this field required, and removes it in 31
						computedFieldInstances: [],
						computedFieldInstancesWithChanges: [],
						computedFieldInstancesWithErrors: [],
						computedFieldInstancesWithoutErrors: [],
						clearedFieldInstances: [],
						document: TEST_DOC_AFTER_CHANGE,
						formalErrorsInOperands: [],
						noErrorOccurred: true
					}
				})
			);

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
					updateEntityInstance: TEST_DOC_AFTER_CHANGE
				})
			);

			handleChangeValue()(
				testDh,
				DataActions.changeValue({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF_VALUE_CHANGED,
					value: TEST_VALUE,
					userValue: TEST_VALUE
				})
			);

			const callArgs = KernelFixtures.RtService.getCallArgs();

			// check recomputation
			notStrictEqual(callArgs.computeA12internal, undefined);
			strictEqual(callArgs.computeA12internal.length, 1);
			partialDeepStrictEqual(callArgs.computeA12internal[0], { document: TEST_DOC_AFTER_CHANGE });

			notStrictEqual(callArgs.computeA12internal[0].externalComputations, undefined);
			// note: cannot assert the externalComputations parameter since these are functions that cannot be compared

			partialDeepStrictEqual(callArgs.computeA12internal[0], {
				changedFieldInstances: [DocumentPath.fromString(TEST_DATA_REF_VALUE_CHANGED)]
			});
		});

		it("revalidation considers formally incorrect values", () => {
			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF_VALUE_CHANGED = "/base[1]/aGroup[1]/aField[1]";
			const TEST_DATA_REF_VALUE_INVALID = "/base[1]/aGroup[1]/bField[1]";
			const TEST_DATA_REF_COMPUTED_VALUE_INVALID = "/base[1]/aGroup[1]/cField[1]";

			const TEST_VALUE = "baz";

			const TEST_DG_DOC: DgDocument = {
				docRef: "foo/1",
				document: {
					// initial document
					base: {
						aGroup: {
							aField: "bar"
						}
					}
				},
				documentModel: emptyDmTestInstance(),
				loadingState: "loaded"
			};

			// after initial value change
			const TEST_DOC_AFTER_UPDATE = {
				base: {
					aGroup: {
						aField: "baz"
					}
				}
			};

			const computedErrorFieldPath = DocumentPath.fromString(TEST_DATA_REF_COMPUTED_VALUE_INVALID);
			const errorFieldInstance: ComputedFieldInstance = {
				document: TEST_DOC_AFTER_UPDATE,
				path: [
					{ elementName: "base", index: 1 },
					{ elementName: "aGroup", index: 1 },
					{ elementName: "cField", index: 1 }
				],
				errorMessage: message({ type: "parseError", entityInstance: computedErrorFieldPath }),
				value: "",
				stringValue: undefined
			};

			DocumentRuntimeServiceFactory.set(
				KernelFixtures.RtService.runtimeFactory({
					computation: {
						appliedTo: doc => TEST_DOC_AFTER_UPDATE,
						// oxlint-disable-next-line typescript/no-deprecated -- kernel 30 declares this field required, and removes it in 31
						computedFieldInstances: [],
						computedFieldInstancesWithChanges: [],
						computedFieldInstancesWithErrors: [errorFieldInstance],
						computedFieldInstancesWithoutErrors: [],
						clearedFieldInstances: [],
						document: TEST_DOC_AFTER_UPDATE,
						formalErrorsInOperands: [errorFieldInstance.errorMessage!],
						noErrorOccurred: false
					}
				})
			);

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
					updateEntityInstance: TEST_DOC_AFTER_UPDATE
				})
			);

			const errorFieldPath = DocumentPath.fromString(TEST_DATA_REF_VALUE_INVALID);
			const errorField2 = "/base[1]/aGroup[1]/dField[1]";
			const errorFieldPath2 = DocumentPath.fromString("/base[1]/aGroup[1]/dField[1]");
			const errorField3 = "/base[1]/aGroup[1]/eField[1]";
			const errorFieldPath3 = DocumentPath.fromString("/base[1]/aGroup[1]/eField[1]");

			const testDh = setupDataHolderWithDocuments([TEST_DG_DOC], {
				"foo/1": {
					errorValues: {
						[TEST_DATA_REF_VALUE_INVALID]: "fooBar"
					},
					messages: [
						message({ type: "parseError", entityInstance: errorFieldPath }),
						message({ type: "parseError", entityInstance: errorFieldPath2 }),
						message({ type: "parseError", entityInstance: errorFieldPath3 })
					]
				}
			});

			const updatedDh = handleChangeValue()(
				testDh,
				DataActions.changeValue({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF_VALUE_CHANGED,
					value: TEST_VALUE,
					userValue: TEST_VALUE
				})
			);

			const callArgs = KernelFixtures.RtService.getCallArgs();

			// check revalidation
			notStrictEqual(callArgs.validatePart, undefined);
			strictEqual(callArgs.validatePart.length, 2);
			notStrictEqual(callArgs.validatePart[1].valuesOfFieldInstancesToConsider, undefined);

			const expectedEntries = [
				TEST_DATA_REF_VALUE_INVALID,
				TEST_DATA_REF_COMPUTED_VALUE_INVALID,
				errorField2,
				errorField3
			];

			(
				(callArgs.validatePart[1] as any).valuesOfFieldInstancesToConsider as Map<
					EntityInstancePath,
					string
				>
			).forEach((_, key) => {
				partialDeepStrictEqual(expectedEntries, [DocumentPath.toString(key)]);
			});

			// new formal error from computation should be added
			partialDeepStrictEqual(updatedDh.data?.validation[TEST_DG_DOC.docRef]!.messages, [
				{
					...errorFieldInstance.errorMessage!
				}
			]);

			// already known formal errors should remain
			ok(
				updatedDh.data?.validation[TEST_DG_DOC.docRef]!.messages.some(
					msg =>
						DocumentPath.equal(msg.entityInstance, errorFieldPath) &&
						msg.rulePath === KernelMessage.FORMAL_VALIDATION
				)
			);

			ok(
				updatedDh.data?.validation[TEST_DG_DOC.docRef]!.messages.some(
					msg =>
						DocumentPath.equal(msg.entityInstance, errorFieldPath2) &&
						msg.rulePath === KernelMessage.FORMAL_VALIDATION
				)
			);

			ok(
				updatedDh.data?.validation[TEST_DG_DOC.docRef]!.messages.some(
					msg =>
						DocumentPath.equal(msg.entityInstance, errorFieldPath3) &&
						msg.rulePath === KernelMessage.FORMAL_VALIDATION
				)
			);
		});

		it("does not remove unknown data slices from the dataholder", () => {
			const TEST_ACTIVITY_ID = "test-activity";
			const TEST_DATA_REF = "/base[1]/aGroup[1]/aField[1]";
			const TEST_VALUE = "baz";

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
								aField: TEST_VALUE
							}
						}
					}
				})
			);

			const standardDh = setupDataHolderWithDocuments([TEST_DOC]);

			const unknownSlice = { foo: "bar" };
			const testDh = {
				...standardDh,
				data: {
					...standardDh.data,
					unknownSlice
				}
			} as DgClAndValidationDataHolderShape;

			const updatedDh = handleChangeValue()(
				testDh,
				DataActions.changeValue({
					activityId: TEST_ACTIVITY_ID,
					dataReference: TEST_DATA_REF,
					value: TEST_VALUE,
					userValue: TEST_VALUE
				})
			);

			partialDeepStrictEqual(updatedDh.data, { unknownSlice });
		});

		describe("extended Kernel type check", () => {
			function setupForTypeCheck(options: {
				value: string;
				previousValue?: KernelTypes.Value;
				previousErrorValue?: string;
				previousMessage?: "parseError" | "ruleError";
				withNewParseError?: true;
			}) {
				const { value, previousValue, previousErrorValue, previousMessage, withNewParseError } =
					options;

				const docRef = "foo/1";
				const dataRef = "/base[1]/aGroup[1]/aField[1]";
				const docPath = DocumentPath.fromString(dataRef);

				const dgDocument: DgDocument = {
					docRef,
					document: {
						base: {
							aGroup: {
								aField: previousValue
							}
						}
					},
					documentModel: emptyDmTestInstance(),
					loadingState: "loaded"
				};

				const formalError: Message = message({ type: "parseError", entityInstance: docPath });

				if (withNewParseError) {
					DocumentRuntimeServiceFactory.set(
						KernelFixtures.RtService.runtimeFactory({
							validation: {
								noErrorOccurred: false,
								messages: [formalError]
							}
						})
					);
				}

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
						getAssignedObject: previousValue,
						updateEntityInstance: {
							base: {
								aGroup: {
									aField: withNewParseError ? null : value
								}
							}
						}
					})
				);

				const testDh = setupDataHolderWithDocuments([dgDocument], {
					[docRef]: {
						messages: previousMessage
							? [message({ type: previousMessage, entityInstance: docPath })]
							: [],
						errorValues: previousErrorValue ? { [dataRef]: previousErrorValue } : {}
					}
				});

				return {
					docRef,
					dataRef,
					dgDocument,
					formalError,
					updatedDh: handleChangeValue()(
						testDh,
						DataActions.changeValue({
							activityId: "1",
							dataReference: dataRef,
							value: value,
							userValue: value
						})
					)
				};
			}

			it("resets the field instance in the entry point document and sets the dirty flag to true", () => {
				const TEST_VALUE = "baz";

				const { dataRef, dgDocument, updatedDh } = setupForTypeCheck({
					value: TEST_VALUE,
					withNewParseError: true
				});

				const callArgs = KernelFixtures.DocService.getCallArgs();

				// check update entity instance call
				notStrictEqual(callArgs.updateEntityInstance, undefined);
				strictEqual(callArgs.updateEntityInstance.length, 2);

				// check the second call
				// first call happens as a workaround in parseWithTypeCheck
				partialDeepStrictEqual(callArgs.updateEntityInstance[1], { document: dgDocument.document });
				partialDeepStrictEqual(callArgs.updateEntityInstance[1], {
					path: DocumentPath.fromString(dataRef)
				});
				partialDeepStrictEqual(callArgs.updateEntityInstance[1], { update: null });

				// check correctly updated data holder
				const updatedDoc =
					updatedDh.data?.documentGraph.documents.byDocRef[updatedDh.data.entryPoint ?? ""];
				assertCondition(updatedDoc?.loadingState === "loaded");

				strictEqual((updatedDoc.document as any).base.aGroup.aField, null);

				strictEqual(updatedDh.dirty, true);
			});

			it("replaces existing messages with a parseError when the type check fails and sets the dirty flag to true", () => {
				const TEST_VALUE = "baz";

				const { docRef, dataRef, formalError, updatedDh } = setupForTypeCheck({
					value: TEST_VALUE,
					previousValue: null, // important to ensure that this works even when the document doesn't change
					previousMessage: "ruleError",
					withNewParseError: true
				});

				deepStrictEqual(updatedDh.data?.validation[docRef], {
					messages: [formalError],
					errorValues: { [dataRef]: TEST_VALUE }
				});
				strictEqual(updatedDh.dirty, true);
			});

			it("does not set the dirty flag to true when the type check fails, but neither the document nor the error values changed", () => {
				const TEST_VALUE = "baz";

				const { docRef, dataRef, formalError, updatedDh } = setupForTypeCheck({
					value: TEST_VALUE,
					previousValue: null,
					previousErrorValue: TEST_VALUE,
					withNewParseError: true
				});

				deepStrictEqual(updatedDh.data?.validation[docRef], {
					messages: [formalError],
					errorValues: { [dataRef]: TEST_VALUE }
				});
				strictEqual(updatedDh.dirty, false);
			});

			it("does not add a parse error when the type check succeeds", () => {
				const TEST_VALUE = "baz";

				const { docRef, updatedDh } = setupForTypeCheck({
					value: TEST_VALUE
				});

				deepStrictEqual(updatedDh.data?.validation[docRef], {
					messages: [],
					errorValues: {}
				});
			});
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

function dmMultiSelectTestInstance(): Model.DocumentAndValidationModel {
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
								id: "multiSelect",
								type: "Group",
								repeatability: 3,
								name: "multiSelect",
								elements: [
									{
										id: "value",
										name: "value",
										fieldType: {
											type: "EnumerationType",
											values: [{ value: "a" }, { value: "b" }, { value: "c" }]
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
							{ elementName: "cField" }
						],
						dependentField: {
							masterField: "-empty-",
							masterFieldPath: [
								{ elementName: "base" },
								{ elementName: "aGroup" },
								{ elementName: "aField" }
							],
							case: [
								{
									masterValue: "a",
									masterValueTyped: "a",
									value: "foo",
									valueTyped: "foo"
								}
							]
						}
					},
					{
						elementRef: "-empty-",
						elementPath: [
							{ elementName: "base" },
							{ elementName: "aGroup" },
							{ elementName: "depField" }
						],
						dependentField: {
							masterField: "-empty-",
							masterFieldPath: [
								{ elementName: "base" },
								{ elementName: "aGroup" },
								{ elementName: "triggerField" }
							],
							case: [
								{
									masterValue: "trigger",
									masterValueTyped: "trigger",
									notRelevant: true,
									valueTyped: null
								}
							]
						}
					}
				]
			},
			groupConfiguration: {
				groupMap: {}
			}
		}
	};
}

function notRelevantConfigsTestInstance(): NotRelevantConfig[] {
	return [
		{
			["/base/aGroup/depField"]: {
				cases: [
					{
						conditions: [
							{
								fieldPath: [
									{ elementName: "base" },
									{ elementName: "aGroup" },
									{ elementName: "triggerField" }
								],
								value: "trigger"
							}
						]
					}
				]
			}
		}
	];
}
