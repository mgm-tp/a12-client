// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual, strictEqual } from "node:assert/strict";

import type { Activity, Model } from "@com.mgmtp.a12.client/client-core";
import { DocumentRtServiceFactoryA12internal } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/a12internal/compute.js";
import { DocumentServiceFactory } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/facade.js";

import { initializeDataComponent } from "../../../core/api/initializeDataComponent.js";
import type { FormModel } from "../../../core/api/model/form-model.js";
import { DocServiceFactory } from "../../../data-mutation/validation-computation/docServiceFactory.js";
import { DocumentRuntimeServiceFactory } from "../../../data-mutation/validation-computation/validationRuntimeService.js";
import { ValidatorProviderFactory } from "../../../data-mutation/validation-computation/validatorProviderFactory.js";
import type { DgDocument } from "../../../internal/documentGraph.js";
import { selectEnumerationValues } from "../../../redux/api/selectors.js";
import { KernelFixtures } from "../../setup/testValidationRuntime.js";

describe("redux.api.selectors", () => {
	describe("selectEnumerationValues", () => {
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

		it("returns all enumeration values of the referenced enum field", () => {
			const state = setupState();

			const preparedValues = [{ value: "a" }, { value: "b" }];

			DocServiceFactory.set(
				KernelFixtures.DocService.instance({
					getByPath: {
						type: "Field",
						id: "testId",
						name: "testName",
						fieldType: {
							type: "EnumerationType",
							values: preparedValues
						}
					}
				})
			);

			strictEqual(
				selectEnumerationValues(state, "test-activity", "/base[1]/testName[1]", []),
				preparedValues
			);
		});

		it("returns all dependent enumeration values of the referenced enum field when it is restricted by a dependent enumeration", () => {
			const enumValues = [{ value: "a" }, { value: "b" }, { value: "c" }, { value: "d" }];
			const dependentCaseValues = [{ value: "c" }, { value: "d" }];

			const state = setupState(dependentCaseValues);

			DocServiceFactory.set(
				KernelFixtures.DocService.instance({
					getByPath: {
						type: "Field",
						id: "testId",
						name: "testName",
						fieldType: {
							type: "EnumerationType",
							values: enumValues
						}
					},
					getAssignedObject: "a" // trigger field value
				})
			);

			deepStrictEqual(
				selectEnumerationValues(state, "test-activity", "/base[1]/testName[1]", []),
				dependentCaseValues
			);
		});

		it("returns no enumeration values when the referenced field is not an enum field", () => {
			const state = setupState();

			DocServiceFactory.set(
				KernelFixtures.DocService.instance({
					getByPath: {
						type: "Field",
						id: "testId",
						name: "testName",
						fieldType: {
							type: "StringType"
						}
					}
				})
			);

			deepStrictEqual(
				selectEnumerationValues(state, "test-activity", "/base[1]/testName[1]", []),
				[]
			);
		});
	});
});

function setupState(dependentEnumValues?: { value: string }[]): object {
	const descriptor: Activity.Descriptor = {
		instance: "test/1",
		model: "test-descriptor-model"
	};

	const doc: DgDocument = {
		docRef: "foo/1",
		document: dependentEnumValues
			? {
					base: {
						triggerField: "a"
					}
				}
			: {},
		documentModel: dmTestInstance(),
		formModel: dependentEnumValues ? fmTestInstance(dependentEnumValues) : undefined,
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

function fmTestInstance(constraintValues: { value: string }[]): FormModel {
	return {
		header: {} as unknown as FormModel["header"],
		content: {
			screens: [],
			defaults: {},
			footerBox: {
				id: "footer"
			},
			subHeaderBox: {
				id: "subheader"
			},
			fieldConfiguration: {
				fieldMap: {},
				field: [
					{
						elementRef: "-empty",
						elementPath: [{ elementName: "base" }, { elementName: "testName" }],
						dependentEnumeration: {
							masterField: "-empty",
							masterFieldPath: [{ elementName: "base" }, { elementName: "triggerField" }],
							constraint: [
								{
									constraintValues,
									masterValue: "a"
								}
							]
						}
					}
				]
			},
			groupConfiguration: {
				groupMap: {}
			}
		}
	};
}
