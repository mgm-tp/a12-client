// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual, throws } from "node:assert/strict";

import { DocumentRtServiceFactoryA12internal } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/a12internal/compute.js";

import { DocumentRuntimeServiceFactory } from "../../../data-mutation/validation-computation/validationRuntimeService.js";
import { ValidatorProviderFactory } from "../../../data-mutation/validation-computation/validatorProviderFactory.js";
import { selectRowCountByPath } from "../../../redux/api/selectors.js";
import { KernelFixtures } from "../../setup/testValidationRuntime.js";

import { mockDgDocument } from "./mocks/mockDg.js";
import { setupStateWithDocuments } from "./mocks/mockState.js";

describe("redux.api.selectors", () => {
	describe("selectRowCountByPath", () => {
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

		it("returns the instance count of the document group as referenced by the given DataReference", () => {
			const doc = mockDgDocument();

			const state = setupStateWithDocuments([doc]);

			strictEqual(selectRowCountByPath(state, "test-activity", "base[1]/aGroup[0]"), 3);
		});

		it("throws if the group as given by the DataReference does not exist", () => {
			const doc = mockDgDocument();

			const state = setupStateWithDocuments([doc]);

			throws(() => selectRowCountByPath(state, "test-activity", "base[1]/bGroup"));
		});

		it("throws if the given by the DataReference does not point to a group", () => {
			const doc = mockDgDocument();

			const state = setupStateWithDocuments([doc]);

			throws(() => selectRowCountByPath(state, "test-activity", "base[1]/aGroup[1]/aField[1]"));
		});
	});
});
