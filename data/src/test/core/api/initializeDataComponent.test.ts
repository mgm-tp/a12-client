// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual, strictEqual, throws } from "node:assert/strict";

import type { Model } from "@com.mgmtp.a12.client/client-core";
import { DocumentRtServiceFactoryA12internal } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/a12internal/compute.js";
import type { ComputedFieldInstance } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { initializeDataComponent } from "../../../core/api/initializeDataComponent.js";
import { DocumentPath } from "../../../core/api/path/documentPath.js";
import { KernelMessage } from "../../../data-mutation/validation-computation/message.js";
import { DocumentRuntimeServiceFactory } from "../../../data-mutation/validation-computation/validationRuntimeService.js";
import { ValidatorProviderFactory } from "../../../data-mutation/validation-computation/validatorProviderFactory.js";
import type { DgDocument, DgLinkInternal } from "../../../internal/documentGraph.js";
import { KernelFixtures } from "../../setup/testValidationRuntime.js";

describe("core.api.initializeDataComponent", () => {
	describe("initializeDataComponent", () => {
		beforeEach(() => {
			ValidatorProviderFactory.set(
				KernelFixtures.ValidatorProvider.instance({
					metaFields: []
				})
			);
			DocumentRuntimeServiceFactory.set(KernelFixtures.RtService.runtimeFactory({}));
		});
		afterEach(() => {
			ValidatorProviderFactory.set({ getValidatorProvider: dm => dm.generatedCodeAccessor });
			DocumentRuntimeServiceFactory.set(DocumentRtServiceFactoryA12internal);
		});

		it("returns an empty DG, changelog and validation slice when given no documents, links and entry point", () => {
			const { documentGraph, changeLog, validation, entryPoint } = initializeDataComponent([], []);

			deepStrictEqual(documentGraph.documents.byDocRef, {});
			deepStrictEqual(changeLog, {
				changes: [],
				changeCounter: 0
			});
			deepStrictEqual(validation, {});
			strictEqual(entryPoint, undefined);
		});

		it("returns a DG that contains the given documents", () => {
			const doc = {
				foo: {
					bar: 1
				}
			};

			const docAfterComputation = {
				foo: {
					bar: 1,
					computed: 42
				}
			};

			const docs: DgDocument[] = [
				{
					docRef: "foo/1",
					documentModel: emptyDm(),
					document: doc,
					loadingState: "loaded",
					computedFields: {}
				},
				{
					docRef: "foo/2",
					documentModel: emptyDm(),
					document: doc,
					loadingState: "loaded",
					computedFields: {}
				}
			];

			const computedFieldInstance: ComputedFieldInstance = {
				document: doc,
				path: [
					{ elementName: "foo", index: 1 },
					{ elementName: "computed", index: 1 }
				],
				errorMessage: undefined,
				value: 42,
				stringValue: "42"
			};

			DocumentRuntimeServiceFactory.set(
				KernelFixtures.RtService.runtimeFactory({
					computation: {
						appliedTo: doc => docAfterComputation,
						// oxlint-disable-next-line typescript/no-deprecated -- kernel 30 declares this field required, and removes it in 31
						computedFieldInstances: [computedFieldInstance],
						computedFieldInstancesWithChanges: [],
						computedFieldInstancesWithErrors: [],
						computedFieldInstancesWithoutErrors: [],
						clearedFieldInstances: [],
						document: docAfterComputation,
						formalErrorsInOperands: [],
						noErrorOccurred: true
					}
				})
			);

			const { documentGraph } = initializeDataComponent(docs);

			deepStrictEqual(documentGraph.documents.byDocRef, {
				["foo/1"]: {
					...docs[0],
					document: docAfterComputation
				},
				["foo/2"]: { ...docs[1], document: docAfterComputation }
			});
		});

		it("returns a DG that contains the given documents except those that were not in loadingState=loaded", () => {
			const docs: DgDocument[] = [
				{
					docRef: "foo/1",
					documentModel: emptyDm(),
					document: {
						foo: {
							bar: 1
						}
					},
					loadingState: "loaded",
					computedFields: {}
				},
				{
					docRef: "foo/2",
					loadingState: "loading"
				}
			];
			const { documentGraph } = initializeDataComponent(docs);

			deepStrictEqual(documentGraph.documents.byDocRef, {
				["foo/1"]: docs[0]
			});
		});

		it("throws if given a non-empty list of links", () => {
			const links: DgLinkInternal[] = [
				{
					linkRef: {
						id: "a-link",
						linkDescriptor: {
							entities: [
								{
									docRef: "foo",
									role: "left"
								},
								{
									docRef: "bar",
									role: "right"
								}
							],
							relationshipModel: "LeftRightRelationship"
						}
					},
					rank: 1
				}
			];
			throws(() => initializeDataComponent([], links));
		});

		it("adds the entryPoint to the returned DgSlice as given via parameter", () => {
			const rootDoc = "foo/1";
			const docs: DgDocument[] = [
				{
					docRef: rootDoc,
					documentModel: emptyDm(),
					document: {
						foo: {
							bar: 1
						}
					},
					loadingState: "loaded",
					computedFields: {}
				}
			];
			const { documentGraph, entryPoint } = initializeDataComponent(docs, [], rootDoc);

			deepStrictEqual(documentGraph.documents.byDocRef, {
				[rootDoc]: docs[0]
			});

			strictEqual(entryPoint, rootDoc);
		});

		it("checks that the given entry point references an actual document", () => {
			const rootDoc = "foo/1";

			throws(() => initializeDataComponent([], [], rootDoc), {
				message: "Cannot set an entry point reference without the document to refer to."
			});
		});

		it("returns a DG that contains the computed fields of a document", () => {
			ValidatorProviderFactory.set(
				KernelFixtures.ValidatorProvider.instance({
					metaFields: [
						{ path: "/foo/nonComp1" },
						{ path: "/foo/nonComp2" },
						{ path: "/foo/comp", operands: ["/foo/nonComp1", "/foo/nonComp2"] }
					]
				})
			);

			const rootDoc = "foo/1";
			const docs: DgDocument[] = [
				{
					docRef: rootDoc,
					documentModel: emptyDm(),
					document: {
						foo: {
							bar: 1
						}
					},
					loadingState: "loaded",
					computedFields: {
						"/foo/comp": ["/foo/nonComp1", "/foo/nonComp2"]
					}
				}
			];
			const { documentGraph } = initializeDataComponent(docs, [], rootDoc);

			deepStrictEqual(documentGraph.documents.byDocRef, {
				[rootDoc]: docs[0]
			});
		});

		it("returns a DG with an initialized validation slice, that contains formal error values from computations for each document", () => {
			const doc = {
				foo: {
					bar: 1
				}
			};

			const docs: DgDocument[] = [
				{
					docRef: "foo/1",
					documentModel: emptyDm(),
					document: doc,
					loadingState: "loaded",
					computedFields: {}
				},
				{
					docRef: "foo/2",
					documentModel: emptyDm(),
					document: doc,
					loadingState: "loaded",
					computedFields: {}
				}
			];

			const computedErrorFieldPathString = "/foo[1]/computed[1]";
			const computedErrorFieldPath = DocumentPath.fromString(computedErrorFieldPathString);

			const errorFieldInstance: ComputedFieldInstance = {
				document: doc,
				path: computedErrorFieldPath,
				errorMessage: {
					entityInstance: computedErrorFieldPath,
					errorCode: "formalValidation",
					errorText: [],
					messageType: "VALUE_ERROR",
					referencedFields: [computedErrorFieldPath],
					refOmissionErrorResponsible: [],
					rulePath: KernelMessage.FORMAL_VALIDATION,
					severity: "ERROR"
				},
				value: -1,
				stringValue: "-1"
			};

			DocumentRuntimeServiceFactory.set(
				KernelFixtures.RtService.runtimeFactory({
					computation: {
						appliedTo: doc => doc,
						// oxlint-disable-next-line typescript/no-deprecated -- kernel 30 declares this field required, and removes it in 31
						computedFieldInstances: [],
						computedFieldInstancesWithChanges: [],
						computedFieldInstancesWithErrors: [errorFieldInstance],
						computedFieldInstancesWithoutErrors: [],
						clearedFieldInstances: [],
						document: doc,
						formalErrorsInOperands: [errorFieldInstance.errorMessage!],
						noErrorOccurred: false
					}
				})
			);

			const { documentGraph, validation } = initializeDataComponent(docs);

			deepStrictEqual(documentGraph.documents.byDocRef, {
				["foo/1"]: docs[0],
				["foo/2"]: docs[1]
			});
			deepStrictEqual(validation, {
				["foo/1"]: { messages: [], errorValues: { [computedErrorFieldPathString]: "-1" } },
				["foo/2"]: { messages: [], errorValues: { [computedErrorFieldPathString]: "-1" } }
			});
		});
	});
});

function emptyDm(): Model.DocumentAndValidationModel {
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
