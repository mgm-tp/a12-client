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

import type { DocumentModel, IGeneratedCodeAccessor } from "@com.mgmtp.a12.kernel/kernel-md-facade";
import { DocumentRtServiceFactoryA12internal } from "@com.mgmtp.a12.kernel/kernel-md-facade/a12internal";

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
