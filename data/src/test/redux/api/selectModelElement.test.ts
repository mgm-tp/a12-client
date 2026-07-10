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

import { ModelPath } from "@com.mgmtp.a12.base/base-model-api";
import type { Activity, Model } from "@com.mgmtp.a12.client/client-core";
import { DocumentServiceFactory, type DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade";
import { DocumentRtServiceFactoryA12internal } from "@com.mgmtp.a12.kernel/kernel-md-facade/a12internal";

import { initializeDataComponent } from "../../../core/api/initializeDataComponent.js";
import { DocServiceFactory } from "../../../data-mutation/validation-computation/docServiceFactory.js";
import { DocumentRuntimeServiceFactory } from "../../../data-mutation/validation-computation/validationRuntimeService.js";
import { ValidatorProviderFactory } from "../../../data-mutation/validation-computation/validatorProviderFactory.js";
import type { DgDocument } from "../../../internal/documentGraph.js";
import { selectModelElement } from "../../../redux/api/selectors.js";
import { KernelFixtures } from "../../setup/testValidationRuntime.js";

describe("redux.api.selectors", () => {
	describe("selectModelElement", () => {
		beforeEach(() => {
			ValidatorProviderFactory.set(
				KernelFixtures.ValidatorProvider.instance({
					metaFields: []
				})
			);
			DocumentRuntimeServiceFactory.set(KernelFixtures.RtService.runtimeFactory({}));
		});
		afterEach(() => {
			DocServiceFactory.set(new DocumentServiceFactory());
			KernelFixtures.DocService.resetHistory();
			ValidatorProviderFactory.set({
				getValidatorProvider: dm => dm.generatedCodeAccessor
			});
			DocumentRuntimeServiceFactory.set(DocumentRtServiceFactoryA12internal);
		});

		it("returns the respective DocumentModel.Field when it is referenced by the given path", () => {
			const state = setupState();

			const preparedField: DocumentModel.Field = {
				id: "test-field",
				name: "test-field",
				fieldType: {
					type: "StringType"
				},
				type: "Field"
			};

			DocServiceFactory.set(KernelFixtures.DocService.instance({ getByPath: preparedField }));

			strictEqual(
				selectModelElement(state, "test-activity", ModelPath.fromString("/base/aField")),
				preparedField
			);
		});

		it("returns the respective DocumentModel.Group when it is referenced by the given path", () => {
			const state = setupState();

			const preparedGroup: DocumentModel.Group = {
				id: "test-group",
				name: "test-group",
				type: "Group",
				elements: [],
				repeatability: 1
			};

			DocServiceFactory.set(KernelFixtures.DocService.instance({ getByPath: preparedGroup }));

			strictEqual(
				selectModelElement(state, "test-activity", ModelPath.fromString("/base/aGroup")),
				preparedGroup
			);
		});

		it("returns undefined when the given path does not refer to an element in the model", () => {
			const state = setupState();

			DocServiceFactory.set(KernelFixtures.DocService.instance({ getByPath: undefined }));

			strictEqual(
				selectModelElement(state, "test-activity", ModelPath.fromString("/xyz/123")),
				undefined
			);
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
