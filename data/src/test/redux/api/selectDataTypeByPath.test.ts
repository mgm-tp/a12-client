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

import type { Activity, Model } from "@com.mgmtp.a12.client/client-core";
import { DocumentServiceFactory, type DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade";
import { DocumentRtServiceFactoryA12internal } from "@com.mgmtp.a12.kernel/kernel-md-facade/a12internal";

import { initializeDataComponent } from "../../../core/api/initializeDataComponent.js";
import { DocServiceFactory } from "../../../data-mutation/validation-computation/docServiceFactory.js";
import { DocumentRuntimeServiceFactory } from "../../../data-mutation/validation-computation/validationRuntimeService.js";
import { ValidatorProviderFactory } from "../../../data-mutation/validation-computation/validatorProviderFactory.js";
import type { DgDocument } from "../../../internal/documentGraph.js";
import { selectDataTypeByPath } from "../../../redux/api/selectors.js";
import { KernelFixtures } from "../../setup/testValidationRuntime.js";

describe("redux.api.selectors", () => {
	describe("selectDataTypeByPath", () => {
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

		it("returns the DocumentModel.FieldType of the field referenced by the given path", () => {
			const state = setupState();

			const preparedFieldType: DocumentModel.FieldType = {
				type: "StringType"
			};

			DocServiceFactory.set(
				KernelFixtures.DocService.instance({
					getByPath: {
						id: "aField-id",
						name: "aField",
						fieldType: preparedFieldType,
						type: "Field"
					}
				})
			);

			strictEqual(selectDataTypeByPath(state, "test-activity", "/base/aField"), preparedFieldType);
		});

		it("returns the usageType of the group referenced by the given path", () => {
			const state = setupState();

			const preparedUsageType = "expected-usage-type";

			DocServiceFactory.set(
				KernelFixtures.DocService.instance({
					getByPath: {
						id: "aGroup-id",
						name: "aGroup",
						type: "Group",
						elements: [],
						repeatability: 1,
						usageType: preparedUsageType
					}
				})
			);

			strictEqual(selectDataTypeByPath(state, "test-activity", "/base/aGroup"), preparedUsageType);
		});

		it("returns undefined when the given path does not refer to an element in the model", () => {
			const state = setupState();

			DocServiceFactory.set(KernelFixtures.DocService.instance({ getByPath: undefined }));

			strictEqual(selectDataTypeByPath(state, "test-activity", "/xyz/123"), undefined);
		});
	});
});

function setupState(): object {
	const descriptor: Activity.Descriptor = {
		instance: "test/1",
		model: "test-descriptor-model"
	};

	const doc: DgDocument = {
		docRef: "foo/1",
		document: {},
		documentModel: emptyDmTestInstance(),
		loadingState: "loaded"
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
						data: initializeDataComponent({ documents: [doc], entryPoint: doc.docRef })
					}
				],
				descriptor,
				id: "test-activity"
			} as Activity
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
