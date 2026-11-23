// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";

import { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { Activity, Model } from "@com.mgmtp.a12.client/client-core";
import { DocumentRtServiceFactoryA12internal } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/a12internal/compute.js";
import type { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";
import { DocumentServiceFactory } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/facade.js";

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
						data: initializeDataComponent([doc], [], doc.docRef)
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
