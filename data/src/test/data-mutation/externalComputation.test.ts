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

import { deepStrictEqual, strictEqual } from "node:assert/strict";

import type { Model } from "@com.mgmtp.a12.client/client-core";
import type { ExternalComputation } from "@com.mgmtp.a12.kernel/kernel-md-facade/a12internal";

import type { FormModel } from "../../core/api/model/form-model.js";
import { convertDependencies } from "../../data-mutation/values/changeValue/externalComputation.js";

describe("data-mutation.externalComputation", () => {
	describe("convertDependencies", () => {
		describe("when given a FormModel", () => {
			it("without any dependencies, returns an empty array", () => {
				const result = convertDependencies(fmTestInstance({}), dmTestInstance());
				deepStrictEqual(result, []);
			});

			it("with one dependent field, returns one external computation for this dependency", () => {
				const result = convertDependencies(
					fmTestInstance({
						fcEntries: [
							{
								elementRef: "-empty",
								elementPath: [{ elementName: "groupA" }, { elementName: "fieldB" }],
								dependentField: {
									masterField: "-empty",
									masterFieldPath: [{ elementName: "groupA" }, { elementName: "fieldA" }],
									case: [
										{
											masterValue: "a",
											masterValueTyped: "a",
											value: "foo",
											valueTyped: "foo"
										}
									]
								}
							}
						]
					}),
					dmTestInstance()
				);
				strictEqual(result.length, 1);
				strictEqual(result[0].inputs.length, 1);
				deepStrictEqual(result[0].inputs[0], [
					{ elementName: "groupA" },
					{ elementName: "fieldA" }
				]);
				deepStrictEqual(result[0].output, [{ elementName: "groupA" }, { elementName: "fieldB" }]);
			});

			it("with one dependent enumeration, returns one external computation for this dependency", () => {
				const result = convertDependencies(
					fmTestInstance({
						fcEntries: [
							{
								elementRef: "-empty",
								elementPath: [{ elementName: "groupA" }, { elementName: "fieldB" }],
								dependentEnumeration: {
									masterField: "-empty",
									masterFieldPath: [{ elementName: "groupA" }, { elementName: "fieldA" }],
									constraint: [
										{
											masterValue: "a",
											valueForMasterChange: "foo",
											constraintValues: [{ value: "foo" }, { value: "bar" }, { value: "baz" }]
										}
									]
								}
							}
						]
					}),
					dmTestInstance()
				);
				strictEqual(result.length, 1);
				strictEqual(result[0].inputs.length, 1);
				deepStrictEqual(result[0].inputs[0], [
					{ elementName: "groupA" },
					{ elementName: "fieldA" }
				]);
				deepStrictEqual(result[0].output, [{ elementName: "groupA" }, { elementName: "fieldB" }]);
			});
		});

		describe("when returning an external computation for a Dependent Field", () => {
			it("it returns the expected field change, when called with a changed trigger field and its respective trigger value", () => {
				const extComps = convertDependencies(
					fmTestInstance({
						fcEntries: [
							{
								elementRef: "-empty",
								elementPath: [{ elementName: "groupA" }, { elementName: "fieldB" }],
								dependentField: {
									masterField: "-empty",
									masterFieldPath: [{ elementName: "groupA" }, { elementName: "fieldA" }],
									case: [
										{
											masterValue: "a",
											masterValueTyped: "a",
											value: "foo",
											valueTyped: "foo"
										}
									]
								}
							}
						]
					}),
					dmTestInstance()
				);

				const depField = extComps[0];

				const result = depField.execute([
					{
						field: [{ elementName: "groupA" }, { elementName: "fieldA" }],
						instances: [
							{
								field: [
									{ elementName: "groupA", index: 1 },
									{ elementName: "fieldA", index: 1 }
								],
								hasChanged: true,
								isValid: true,
								value: "a"
							}
						]
					}
				]);

				const expected: ExternalComputation.FieldResult = {
					type: "Field",
					field: [
						{ elementName: "groupA", index: 1 },
						{ elementName: "fieldB", index: 1 }
					],
					value: "foo"
				};

				deepStrictEqual(result, [expected]);
			});

			it("it returns the expected field change to the referenced fields value, when called with a changed trigger field and its respective trigger value", () => {
				const extComps = convertDependencies(
					fmTestInstance({
						fcEntries: [
							{
								elementRef: "-empty",
								elementPath: [{ elementName: "groupA" }, { elementName: "fieldB" }],
								dependentField: {
									masterField: "-empty",
									masterFieldPath: [{ elementName: "groupA" }, { elementName: "fieldA" }],
									case: [
										{
											masterValue: "a",
											masterValueTyped: "a",
											fieldPath: [{ elementName: "groupA" }, { elementName: "fieldC" }],
											valueTyped: null
										}
									]
								}
							}
						]
					}),
					dmTestInstance()
				);

				const depField = extComps[0];

				const result = depField.execute([
					{
						field: [{ elementName: "groupA" }, { elementName: "fieldA" }],
						instances: [
							{
								field: [
									{ elementName: "groupA", index: 1 },
									{ elementName: "fieldA", index: 1 }
								],
								hasChanged: true,
								isValid: true,
								value: "a"
							}
						]
					},
					{
						field: [{ elementName: "groupA" }, { elementName: "fieldC" }],
						instances: [
							{
								field: [
									{ elementName: "groupA", index: 1 },
									{ elementName: "fieldC", index: 1 }
								],
								hasChanged: false,
								isValid: true,
								value: "foo"
							}
						]
					}
				]);

				const expected: ExternalComputation.FieldResult = {
					type: "Field",
					field: [
						{ elementName: "groupA", index: 1 },
						{ elementName: "fieldB", index: 1 }
					],
					value: "foo"
				};

				deepStrictEqual(result, [expected]);
			});

			it("it uses the referenced fields granularity for the dependent field when it is more significant than the master fields granularity", () => {
				const extComps = convertDependencies(
					fmTestInstance({
						fcEntries: [
							{
								elementRef: "-empty",
								elementPath: [
									{ elementName: "groupA" },
									{ elementName: "nestedGroup" },
									{ elementName: "deeplyNestedGroup" },
									{ elementName: "deeplyNestedField" }
								],
								dependentField: {
									masterField: "-empty",
									masterFieldPath: [{ elementName: "groupA" }, { elementName: "fieldA" }],
									case: [
										{
											masterValue: "a",
											masterValueTyped: "a",
											fieldPath: [
												{ elementName: "groupA" },
												{ elementName: "nestedGroup" },
												{ elementName: "nestedField" }
											],
											valueTyped: null
										}
									]
								}
							}
						]
					}),
					dmTestInstance()
				);

				const depField = extComps[0];

				const result = depField.execute([
					{
						field: [{ elementName: "groupA" }, { elementName: "fieldA" }],
						instances: [
							{
								field: [
									{ elementName: "groupA", index: 1 },
									{ elementName: "fieldA", index: 1 }
								],
								hasChanged: true,
								isValid: true,
								value: "a"
							}
						]
					},
					{
						field: [
							{ elementName: "groupA" },
							{ elementName: "nestedGroup" },
							{ elementName: "nestedField" }
						],
						instances: [
							{
								field: [
									{ elementName: "groupA", index: 1 },
									{ elementName: "nestedGroup", index: 1 },
									{ elementName: "nestedField", index: 1 }
								],
								hasChanged: false,
								isValid: true,
								value: "foo"
							}
						]
					},
					{
						field: [
							{ elementName: "groupA" },
							{ elementName: "nestedGroup" },
							{ elementName: "nestedField" }
						],
						instances: [
							{
								field: [
									{ elementName: "groupA", index: 1 },
									{ elementName: "nestedGroup", index: 2 },
									{ elementName: "nestedField", index: 1 }
								],
								hasChanged: false,
								isValid: true,
								value: "bar"
							}
						]
					},
					{
						field: [
							{ elementName: "groupA" },
							{ elementName: "nestedGroup" },
							{ elementName: "nestedField" }
						],
						instances: [
							{
								field: [
									{ elementName: "groupA", index: 1 },
									{ elementName: "nestedGroup", index: 3 },
									{ elementName: "nestedField", index: 1 }
								],
								hasChanged: false,
								isValid: true,
								value: "baz"
							}
						]
					}
				]);

				const expected: ExternalComputation.FieldResult[] = [
					{
						type: "Field",
						field: [
							{ elementName: "groupA", index: 1 },
							{ elementName: "nestedGroup", index: 1 },
							{ elementName: "deeplyNestedGroup", index: 0 },
							{ elementName: "deeplyNestedField", index: 1 }
						],
						value: "foo"
					},
					{
						type: "Field",
						field: [
							{ elementName: "groupA", index: 1 },
							{ elementName: "nestedGroup", index: 2 },
							{ elementName: "deeplyNestedGroup", index: 0 },
							{ elementName: "deeplyNestedField", index: 1 }
						],
						value: "bar"
					},
					{
						type: "Field",
						field: [
							{ elementName: "groupA", index: 1 },
							{ elementName: "nestedGroup", index: 3 },
							{ elementName: "deeplyNestedGroup", index: 0 },
							{ elementName: "deeplyNestedField", index: 1 }
						],
						value: "baz"
					}
				];

				deepStrictEqual(result, expected);
			});

			it("it returns the expected field change for all dependent field instances when the trigger field is used to modify a repeatable field", () => {
				const extComps = convertDependencies(
					fmTestInstance({
						fcEntries: [
							{
								elementRef: "-empty",
								elementPath: [
									{ elementName: "groupA" },
									{ elementName: "nestedGroup" },
									{ elementName: "nestedField" }
								],
								dependentField: {
									masterField: "-empty",
									masterFieldPath: [{ elementName: "groupA" }, { elementName: "fieldA" }],
									case: [
										{
											masterValue: "a",
											masterValueTyped: "a",
											value: "foo",
											valueTyped: "foo"
										}
									]
								}
							}
						]
					}),
					dmTestInstance()
				);

				const depField = extComps[0];

				const result = depField.execute([
					{
						field: [{ elementName: "groupA" }, { elementName: "fieldA" }],
						instances: [
							{
								field: [
									{ elementName: "groupA", index: 1 },
									{ elementName: "fieldA", index: 1 }
								],
								hasChanged: true,
								isValid: true,
								value: "a"
							}
						]
					}
				]);

				const expected: ExternalComputation.FieldResult = {
					type: "Field",
					field: [
						{ elementName: "groupA", index: 1 },
						{ elementName: "nestedGroup", index: 0 },
						{ elementName: "nestedField", index: 1 }
					],
					value: "foo"
				};

				deepStrictEqual(result, [expected]);
			});

			it("it returns no field change, when called with an unchanged trigger field", () => {
				const extComps = convertDependencies(
					fmTestInstance({
						fcEntries: [
							{
								elementRef: "-empty",
								elementPath: [{ elementName: "groupA" }, { elementName: "fieldB" }],
								dependentField: {
									masterField: "-empty",
									masterFieldPath: [{ elementName: "groupA" }, { elementName: "fieldA" }],
									case: [
										{
											masterValue: "a",
											masterValueTyped: "a",
											value: "foo",
											valueTyped: "foo"
										}
									]
								}
							}
						]
					}),
					dmTestInstance()
				);

				const depField = extComps[0];

				const result = depField.execute([
					{
						field: [{ elementName: "groupA" }, { elementName: "fieldA" }],
						instances: [
							{
								field: [
									{ elementName: "groupA", index: 1 },
									{ elementName: "fieldA", index: 1 }
								],
								hasChanged: false,
								isValid: true,
								value: "a"
							}
						]
					}
				]);

				deepStrictEqual(result, []);
			});

			it("it returns no field change, when called with a changed trigger field and a value that is not part of a case", () => {
				const extComps = convertDependencies(
					fmTestInstance({
						fcEntries: [
							{
								elementRef: "-empty",
								elementPath: [{ elementName: "groupA" }, { elementName: "fieldB" }],
								dependentField: {
									masterField: "-empty",
									masterFieldPath: [{ elementName: "groupA" }, { elementName: "fieldA" }],
									case: [
										{
											masterValue: "a",
											masterValueTyped: "a",
											value: "foo",
											valueTyped: "foo"
										}
									]
								}
							}
						]
					}),
					dmTestInstance()
				);

				const depField = extComps[0];

				const result = depField.execute([
					{
						field: [{ elementName: "groupA" }, { elementName: "fieldA" }],
						instances: [
							{
								field: [
									{ elementName: "groupA", index: 1 },
									{ elementName: "fieldA", index: 1 }
								],
								hasChanged: true,
								isValid: true,
								value: "c"
							}
						]
					}
				]);

				deepStrictEqual(result, []);
			});
		});

		describe("when returning an external computation for a Dependent Enumeration", () => {
			it("returns a field change to reset the value, when called with a changed trigger field and a value that matches a case without initial value", () => {
				const extComps = convertDependencies(
					fmTestInstance({
						fcEntries: [
							{
								elementRef: "-empty",
								elementPath: [{ elementName: "groupA" }, { elementName: "fieldD" }],
								dependentEnumeration: {
									masterField: "-empty",
									masterFieldPath: [{ elementName: "groupA" }, { elementName: "fieldA" }],
									constraint: [
										{
											masterValue: "a",
											constraintValues: [{ value: "caseA" }],
											valueForMasterChange: undefined
										}
									]
								}
							}
						]
					}),
					dmTestInstance()
				);

				const depField = extComps[0];

				const result = depField.execute([
					{
						field: [{ elementName: "groupA" }, { elementName: "fieldA" }],
						instances: [
							{
								field: [
									{ elementName: "groupA", index: 1 },
									{ elementName: "fieldA", index: 1 }
								],
								hasChanged: true,
								isValid: true,
								value: "a"
							}
						]
					}
				]);

				const expected: ExternalComputation.FieldResult = {
					type: "Field",
					field: [
						{ elementName: "groupA", index: 1 },
						{ elementName: "fieldD", index: 1 }
					],
					value: null
				};

				deepStrictEqual(result, [expected]);
			});

			it("returns no field change, when called with an unchanged trigger field", () => {
				const extComps = convertDependencies(
					fmTestInstance({
						fcEntries: [
							{
								elementRef: "-empty",
								elementPath: [{ elementName: "groupA" }, { elementName: "fieldD" }],
								dependentEnumeration: {
									masterField: "-empty",
									masterFieldPath: [{ elementName: "groupA" }, { elementName: "fieldA" }],
									constraint: [
										{
											masterValue: "a",
											constraintValues: [{ value: "caseA" }],
											valueForMasterChange: undefined
										}
									]
								}
							}
						]
					}),
					dmTestInstance()
				);

				const depField = extComps[0];

				const result = depField.execute([
					{
						field: [{ elementName: "groupA" }, { elementName: "fieldA" }],
						instances: [
							{
								field: [
									{ elementName: "groupA", index: 1 },
									{ elementName: "fieldA", index: 1 }
								],
								hasChanged: false,
								isValid: true,
								value: "a"
							}
						]
					}
				]);

				deepStrictEqual(result, []);
			});

			it("returns a field change with the initial value, when called with a changed trigger field and a value that matches a case with an initial value", () => {
				const extComps = convertDependencies(
					fmTestInstance({
						fcEntries: [
							{
								elementRef: "-empty",
								elementPath: [{ elementName: "groupA" }, { elementName: "fieldD" }],
								dependentEnumeration: {
									masterField: "-empty",
									masterFieldPath: [{ elementName: "groupA" }, { elementName: "fieldA" }],
									constraint: [
										{
											masterValue: "a",
											constraintValues: [{ value: "caseA" }],
											valueForMasterChange: "caseA"
										}
									]
								}
							}
						]
					}),
					dmTestInstance()
				);

				const depField = extComps[0];

				const result = depField.execute([
					{
						field: [{ elementName: "groupA" }, { elementName: "fieldA" }],
						instances: [
							{
								field: [
									{ elementName: "groupA", index: 1 },
									{ elementName: "fieldA", index: 1 }
								],
								hasChanged: true,
								isValid: true,
								value: "a"
							}
						]
					}
				]);

				const expected: ExternalComputation.FieldResult = {
					type: "Field",
					field: [
						{ elementName: "groupA", index: 1 },
						{ elementName: "fieldD", index: 1 }
					],
					value: "caseA"
				};

				deepStrictEqual(result, [expected]);
			});
		});
	});
});

function dmTestInstance(): Model.DocumentAndValidationModel {
	return {
		header: {} as unknown as Model.DocumentAndValidationModel["header"],
		content: {
			modelConfig: {
				timeZone: ""
			},
			modelInfo: {},
			modelRoot: {
				type: "Group",
				id: "ROOTGROUP",
				name: "ROOTGROUP",
				repeatability: 1,
				elements: [
					{
						type: "Group",
						id: "groupA",
						name: "groupA",
						elements: [
							{
								type: "Field",
								id: "fieldA",
								name: "fieldA",
								fieldType: {
									type: "EnumerationType",
									values: [
										{
											value: "a"
										}
									]
								}
							},
							{
								type: "Field",
								id: "fieldB",
								name: "fieldB",
								fieldType: {
									type: "StringType"
								}
							},
							{
								type: "Field",
								id: "fieldC",
								name: "fieldC",
								fieldType: {
									type: "StringType"
								}
							},
							{
								type: "Field",
								id: "fieldD",
								name: "fieldD",
								fieldType: {
									type: "EnumerationType",
									values: [
										{
											value: "caseA"
										},
										{
											value: "caseB"
										},
										{
											value: "caseC"
										}
									]
								}
							},
							{
								type: "Group",
								id: "nestedGroup",
								name: "nestedGroup",
								repeatability: 100,
								elements: [
									{
										type: "Field",
										id: "nestedField",
										name: "nestedField",
										fieldType: {
											type: "StringType"
										}
									},
									{
										type: "Field",
										id: "nestedReferenceField",
										name: "nestedReferenceField",
										fieldType: {
											type: "StringType"
										}
									},
									{
										type: "Group",
										id: "deeplyNestedGroup",
										name: "deeplyNestedGroup",
										repeatability: 100,
										elements: [
											{
												type: "Field",
												id: "deeplyNestedField",
												name: "deeplyNestedField",
												fieldType: {
													type: "StringType"
												}
											}
										]
									}
								]
							}
						],
						repeatability: 1
					}
				]
			},
			documentUniquenessCriteria: []
		} as Model.DocumentAndValidationModel["content"],
		generatedCodeAccessor: {
			getCalculator() {},
			getMetaModel() {},
			getValidator() {}
		}
	};
}

function fmTestInstance(config: {
	fcEntries?: FormModel.FieldConfigurationEntry[];
	gcEntries?: FormModel.GroupConfigurationEntry[];
}): FormModel {
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
				field: config.fcEntries || [],
				fieldMap: {}
			},
			groupConfiguration: {
				group: config.gcEntries || [],
				groupMap: {}
			}
		}
	};
}
