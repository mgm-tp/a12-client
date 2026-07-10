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

import { deepStrictEqual, strictEqual, throws } from "node:assert/strict";

import { DocumentRtServiceFactoryA12internal } from "@com.mgmtp.a12.kernel/kernel-md-facade/a12internal";
import { DocumentServiceFactory } from "@com.mgmtp.a12.kernel/kernel-md-facade";

import { DocServiceFactory } from "../../../data-mutation/validation-computation/docServiceFactory.js";
import { DocumentRuntimeServiceFactory } from "../../../data-mutation/validation-computation/validationRuntimeService.js";
import { ValidatorProviderFactory } from "../../../data-mutation/validation-computation/validatorProviderFactory.js";
import type { DgDocument } from "../../../internal/documentGraph.js";
import { selectValueByPath } from "../../../redux/api/selectors.js";
import { KernelFixtures } from "../../setup/testValidationRuntime.js";

import { mockDgDocument } from "./mocks/mockDg.js";
import { setupStateWithDocuments } from "./mocks/mockState.js";

describe("redux.api.selectors", () => {
	before(() => {
		DocServiceFactory.set(new DocumentServiceFactory());
	});
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

	describe("selectValueByPath", () => {
		it("returns the value of the document field instance as referenced by the given DataReference", () => {
			const doc = mockDgDocument();

			const state = setupStateWithDocuments([doc]);

			strictEqual(selectValueByPath(state, "test-activity", "base[1]/aGroup[1]/aField[1]"), "foo");
		});

		it("returns the value of the document field instance in a repeatable group as referenced by the given DataReference", () => {
			const doc = mockDgDocument();

			const state = setupStateWithDocuments([doc]);

			strictEqual(selectValueByPath(state, "test-activity", "base[1]/aGroup[3]/aField[1]"), "baz");
		});

		// FIXME: A12UIF-93
		it("returns the whole document when selecting /", () => {
			type LoadedDgDocument = Extract<DgDocument, { loadingState: "loaded" }>;
			const doc = mockDgDocument() as LoadedDgDocument;

			const state = setupStateWithDocuments([doc]);

			deepStrictEqual(selectValueByPath(state, "test-activity", "/"), doc.document);
		});

		it("returns undefined if the given DataReference points to a non-existent field instance", () => {
			const doc = mockDgDocument();

			const state = setupStateWithDocuments([doc]);

			strictEqual(
				selectValueByPath(state, "test-activity", "base[1]/aUniqueGroup[1]/anotherField[1]"),
				undefined
			);
		});

		it("throws if the given DataReference points to an invalid field instance", () => {
			const doc = mockDgDocument();

			const state = setupStateWithDocuments([doc]);

			throws(() => selectValueByPath(state, "test-activity", "base[1]/invalid[1]"));
		});

		it("returns undefined when the activity does not contain a DG and entryPoint", () => {
			const state = setupStateWithDocuments([]);

			strictEqual(
				selectValueByPath(state, "test-activity", "base[1]/aGroup[3]/aField[1]"),
				undefined
			);
		});
	});
});
