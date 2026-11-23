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
import { selectTimeZone } from "../../../redux/api/selectors.js";
import { KernelFixtures } from "../../setup/testValidationRuntime.js";

describe("redux.api.selectors", () => {
	describe("selectTimeZone", () => {
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

		it("returns the timeZone property of the root entity's document model", () => {
			const state = setupState(true);

			strictEqual(selectTimeZone(state, "test-activity"), "UTC");
		});

		it("returns undefined when there is no root entity", () => {
			const state = setupState();

			strictEqual(selectTimeZone(state, "test-activity"), undefined);
		});
	});
});

function setupState(withDocument?: true): object {
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
						data: initializeDataComponent(
							withDocument ? [doc] : [],
							[],
							withDocument ? doc.docRef : undefined
						)
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
		content: {
			modelConfig: {
				timeZone: "UTC"
			},
			modelInfo: {},
			modelRoot: {
				id: "ROOT",
				name: "ROOT",
				type: "Group",
				elements: [],
				repeatability: 1
			}
		},
		generatedCodeAccessor: {
			getCalculator() {},
			getMetaModel() {},
			getValidator() {}
		}
	};
}
