// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";

import type { Activity, Model } from "@com.mgmtp.a12.client/client-core";
import { DocumentRtServiceFactoryA12internal } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/a12internal/compute.js";

import { initializeDataComponent } from "../../../core/api/initializeDataComponent.js";
import { DocumentRuntimeServiceFactory } from "../../../data-mutation/validation-computation/validationRuntimeService.js";
import { ValidatorProviderFactory } from "../../../data-mutation/validation-computation/validatorProviderFactory.js";
import type { DgDocument } from "../../../internal/documentGraph.js";
import { selectFieldComputed } from "../../../redux/api/selectors.js";
import { KernelFixtures } from "../../setup/testValidationRuntime.js";

describe("redux.api.selectors", () => {
	describe("selectFieldComputed", () => {
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

		it("returns true when called with a reference to a computed field", () => {
			const state = setupState();

			ValidatorProviderFactory.set(
				KernelFixtures.ValidatorProvider.instance({
					metaFields: [{ path: "/base/aField", operands: ["/base/bField"] }]
				})
			);

			strictEqual(selectFieldComputed(state, "test-activity", "/base[1]/aField[1]"), true);
		});

		it("returns false when called with a reference to a field that is not computed", () => {
			const state = setupState();

			ValidatorProviderFactory.set(
				KernelFixtures.ValidatorProvider.instance({
					metaFields: [{ path: "/base/anotherField" }]
				})
			);

			strictEqual(selectFieldComputed(state, "test-activity", "/base[1]/aField[1]"), false);
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
		documentModel: dmTestInstance(),
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

function dmTestInstance(): Model.DocumentAndValidationModel {
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
