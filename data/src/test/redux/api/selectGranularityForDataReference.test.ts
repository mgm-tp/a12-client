// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual } from "node:assert/strict";

import type { Activity, Model } from "@com.mgmtp.a12.client/client-core";
import { DocumentRtServiceFactoryA12internal } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/a12internal/compute.js";

import { initializeDataComponent } from "../../../core/api/initializeDataComponent.js";
import { DocumentRuntimeServiceFactory } from "../../../data-mutation/validation-computation/validationRuntimeService.js";
import { ValidatorProviderFactory } from "../../../data-mutation/validation-computation/validatorProviderFactory.js";
import type { DgDocument } from "../../../internal/documentGraph.js";
import { selectGranularityForDataReference } from "../../../redux/api/selectors.js";
import { KernelFixtures } from "../../setup/testValidationRuntime.js";

describe("redux.api.selectors", () => {
	describe("selectGranularityForDataReference", () => {
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

		it("returns the empty granularity for an element that is not nested in any repeatable group", () => {
			const state = setupState();

			deepStrictEqual(
				selectGranularityForDataReference(state, "test-activity", "/base[1]/aField[1]"),
				[]
			);
		});

		it("returns the granularity for the last repeatable group on the path to the referenced element", () => {
			const state = setupState();

			deepStrictEqual(
				selectGranularityForDataReference(
					state,
					"test-activity",
					"/base[1]/nestedGroup[2]/deeperNestedGroup[3]/aField[1]"
				),
				[
					[
						{ elementName: "base", index: 1 },
						{ elementName: "nestedGroup", index: 2 }
					],
					[
						{ elementName: "base", index: 1 },
						{ elementName: "nestedGroup", index: 2 },
						{ elementName: "deeperNestedGroup", index: 3 }
					]
				]
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
		content: {
			modelConfig: {
				timeZone: ""
			},
			modelInfo: {},
			modelRoot: {
				id: "ROOT",
				name: "ROOT",
				type: "Group",
				elements: [
					{
						id: "base",
						name: "base",
						type: "Group",
						elements: [
							{
								id: "nestedGroup",
								name: "nestedGroup",
								type: "Group",
								elements: [
									{
										id: "deeperNestedGroup",
										name: "deeperNestedGroup",
										type: "Group",
										elements: [
											{
												id: "aField",
												name: "aField",
												type: "Field",
												fieldType: {
													type: "StringType"
												}
											}
										],
										repeatability: 99
									}
								],
								repeatability: 99
							},
							{
								id: "aField",
								name: "aField",
								type: "Field",
								fieldType: {
									type: "StringType"
								}
							}
						],
						repeatability: 1
					}
				],
				repeatability: 1
			}
		}, // as unknown as Model.DocumentAndValidationModel["content"],
		generatedCodeAccessor: {
			getCalculator() {},
			getMetaModel() {},
			getValidator() {}
		}
	};
}
