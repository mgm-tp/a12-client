// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";

import { DocumentRtServiceFactoryA12internal } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/a12internal/compute.js";
import type {
	DocumentModel,
	IGeneratedCodeAccessor
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { DocumentRuntimeServiceFactory } from "../../../data-mutation/validation-computation/validationRuntimeService.js";
import { ValidatorProviderFactory } from "../../../data-mutation/validation-computation/validatorProviderFactory.js";
import type { DgDocument } from "../../../internal/documentGraph.js";
import { selectDocumentModelName } from "../../../redux/api/selectors.js";
import { KernelFixtures } from "../../setup/testValidationRuntime.js";

import { setupStateWithDocuments } from "./mocks/mockState.js";

describe("redux.api.selectors", () => {
	describe("selectDocumentModelName", () => {
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

		it("returns the document model name of the entry point document", () => {
			const dmName = "foo-dm";
			const doc: DgDocument = {
				docRef: "foo/1",
				document: {
					base: {
						aGroup: {
							aField: "foo"
						}
					}
				},
				documentModel: {
					header: {
						id: dmName,
						modelType: "document",
						modelVersion: "99.99.99"
					},
					content: undefined as unknown as DocumentModel["content"],
					generatedCodeAccessor: undefined as unknown as IGeneratedCodeAccessor
				},
				loadingState: "loaded"
			};

			const state = setupStateWithDocuments([doc]);

			strictEqual(selectDocumentModelName(state, "test-activity"), dmName);
		});

		it("returns undefined if there is no entry point document", () => {
			const state = setupStateWithDocuments([]);

			strictEqual(selectDocumentModelName(state, "test-activity"), undefined);
		});
	});
});
