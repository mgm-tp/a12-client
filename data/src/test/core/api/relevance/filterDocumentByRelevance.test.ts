// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual, strictEqual } from "node:assert/strict";

import type { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { Model } from "@com.mgmtp.a12.client/client-core";
import type { FieldInstanceValue } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { filterDocumentByRelevance } from "../../../../core/api/model/relevance/filterDocumentByRelevance.js";
import type {
	NotRelevantConfig,
	NotRelevantConfigEntry
} from "../../../../core/api/model/relevance/notRelevantConfig.js";

describe("core.api.filterDocumentByRelevance", () => {
	it("returns the given document back when no form model was given", () => {
		const TEST_DOC = { base: { triggerDepField: "a", depField: "xyz" } };
		const filteredDoc = filterDocumentByRelevance(TEST_DOC, dmTestInstance());
		strictEqual(filteredDoc, TEST_DOC);
	});

	it("returns the given document back when a form model is given and all field & group instances are relevant", () => {
		const TEST_DOC = {
			base: {
				triggerDepField: "b",
				depField: "xyz",
				triggerDepGroup1: "b",
				triggerDepGroup2: "b",
				depGroup1: {
					dummyField: "foo"
				},
				depGroup2: [
					{
						dummyField: "foo"
					},
					{
						dummyField: "bar"
					},
					{
						dummyField: "baz"
					}
				]
			}
		};
		const filteredDoc = filterDocumentByRelevance(
			TEST_DOC,
			dmTestInstance(),
			notRelevantConfigsTestInstance()
		);
		deepStrictEqual(filteredDoc, TEST_DOC);
	});

	describe("when a dependent field case is matching", () => {
		it("returns the given document without the dependent field instance", () => {
			const TEST_DOC = {
				base: {
					triggerDepField: "a",
					depField: "xyz"
				}
			};
			const filteredDoc = filterDocumentByRelevance(
				TEST_DOC,
				dmTestInstance(),
				notRelevantConfigsTestInstance()
			);
			deepStrictEqual(filteredDoc, { base: { triggerDepField: "a" } });
		});
	});

	describe("when a dependent group case is matching for a non-repeatable group", () => {
		it("returns the given document without the dependent group instance", () => {
			const TEST_DOC = {
				base: {
					triggerDepGroup1: "a",
					depGroup1: {
						dummyField: "foo"
					}
				}
			};
			const filteredDoc = filterDocumentByRelevance(
				TEST_DOC,
				dmTestInstance(),
				notRelevantConfigsTestInstance()
			);
			deepStrictEqual(filteredDoc, {
				base: {
					triggerDepGroup1: "a"
				}
			});
		});
	});

	describe("when a dependent group case is matching for a repeatable group", () => {
		it("returns the given document without all of the dependent group instances", () => {
			const TEST_DOC = {
				base: {
					triggerDepGroup2: "a",
					depGroup2: [
						{
							dummyField: "foo"
						},
						{
							dummyField: "bar"
						},
						{
							dummyField: "baz"
						}
					]
				}
			};
			const filteredDoc = filterDocumentByRelevance(
				TEST_DOC,
				dmTestInstance(),
				notRelevantConfigsTestInstance()
			);
			deepStrictEqual(filteredDoc, {
				base: {
					triggerDepGroup2: "a"
				}
			});
		});
	});
});

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
				type: "Group",
				name: "ROOT_GROUP",
				repeatability: 1,
				elements: [
					{
						id: "group-001",
						type: "Group",
						repeatability: 1,
						name: "base",
						elements: [
							{
								id: "triggerDepField",
								name: "triggerDepField",
								fieldType: {
									type: "EnumerationType",
									values: [{ value: "a" }, { value: "b" }]
								},
								type: "Field"
							},
							{
								id: "depField",
								name: "depField",
								fieldType: {
									type: "StringType"
								},
								type: "Field"
							},
							{
								id: "triggerDepGroup1",
								name: "triggerDepGroup1",
								fieldType: {
									type: "EnumerationType",
									values: [{ value: "a" }, { value: "b" }]
								},
								type: "Field"
							},
							{
								id: "triggerDepGroup2",
								name: "triggerDepGroup2",
								fieldType: {
									type: "EnumerationType",
									values: [{ value: "a" }, { value: "b" }]
								},
								type: "Field"
							},
							{
								id: "depGroup1",
								name: "depGroup1",
								type: "Group",
								elements: [
									{
										id: "dummyField",
										name: "dummyField",
										fieldType: {
											type: "StringType"
										},
										type: "Field"
									}
								],
								repeatability: 1
							},
							{
								id: "depGroup2",
								name: "depGroup2",
								type: "Group",
								elements: [
									{
										id: "dummyField",
										name: "dummyField",
										fieldType: {
											type: "StringType"
										},
										type: "Field"
									}
								],
								repeatability: 10
							}
						]
					}
				]
			}
		},
		generatedCodeAccessor: {
			getCalculator() {},
			getMetaModel() {},
			getValidator() {}
		}
	};
}

function notRelevantConfigsTestInstance(): NotRelevantConfig[] {
	function createConfigEntry(
		fieldPath: ModelPath,
		value: FieldInstanceValue
	): NotRelevantConfigEntry {
		return {
			cases: [
				{
					conditions: [
						{
							fieldPath,
							value
						}
					]
				}
			]
		};
	}

	return [
		{
			["/base/depField"]: createConfigEntry(
				[{ elementName: "base" }, { elementName: "triggerDepField" }],
				"a"
			),
			["/base/depGroup1"]: createConfigEntry(
				[{ elementName: "base" }, { elementName: "triggerDepGroup1" }],
				"a"
			),
			["/base/depGroup2"]: createConfigEntry(
				[{ elementName: "base" }, { elementName: "triggerDepGroup2" }],
				"a"
			)
		}
	];
}
