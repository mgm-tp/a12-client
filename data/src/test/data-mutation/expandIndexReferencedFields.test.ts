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

import { deepStrictEqual } from "node:assert/strict";

import type { DocumentModel, Message } from "@com.mgmtp.a12.kernel/kernel-md-facade";

import { expandIndexReferencedFields } from "../../data-mutation/validation-computation/expandIndexReferencedFields.js";

import { messageDefaults } from "../redux/api/mocks/mockMessage.js";

describe("data-mutation.validation", () => {
	describe("expandIndexReferencedFields", () => {
		it("when given a message without any index 0 in the referenced fields, returns the unchanged message", () => {
			const result = expandIndexReferencedFields(testError(), {}, dmTestInstance());
			deepStrictEqual(result, testError());
		});

		it("when given a message with 0 indices in the referenced fields, returns the validation object with all referenced fields expanded to all existing indices", () => {
			const result = expandIndexReferencedFields(
				testError(true),
				{
					foo: {
						rep: [
							{
								rep2: [{ field: "abc" }, { field: "def" }]
							},
							{
								rep2: [{ field: "ghi" }, { field: "jkl" }]
							}
						]
					}
				},
				dmTestInstance()
			);

			deepStrictEqual(result, expandedTestError());
		});
	});
});

function testError(withReferencedFields?: true): Message {
	return {
		...messageDefaults,
		entityInstance: [
			{ elementName: "foo", index: 1 },
			{ elementName: "bar", index: 1 }
		],
		errorCode: "abc",
		errorText: [
			{
				key: "some.key",
				defaults: { en: "error text" }
			}
		],
		messageType: "VALUE_ERROR",
		referencedFields: withReferencedFields
			? [
					[
						{ elementName: "foo", index: 1 },
						{ elementName: "bar", index: 1 }
					],
					[
						{ elementName: "foo", index: 1 },
						{ elementName: "rep", index: 0 },
						{ elementName: "rep2", index: 0 },
						{ elementName: "field", index: 1 }
					],
					[
						{ elementName: "foo", index: 1 },
						{ elementName: "baz", index: 1 }
					],
					[
						{ elementName: "foo", index: 1 },
						{ elementName: "rep", index: 0 },
						{ elementName: "ms", index: 0 },
						{ elementName: "value", index: 1 }
					]
				]
			: [],
		refOmissionErrorResponsible: withReferencedFields
			? [
					[
						{ elementName: "foo", index: 1 },
						{ elementName: "bar", index: 1 }
					],
					[
						{ elementName: "foo", index: 1 },
						{ elementName: "rep", index: 0 },
						{ elementName: "rep2", index: 0 },
						{ elementName: "field", index: 1 }
					],
					[
						{ elementName: "foo", index: 1 },
						{ elementName: "baz", index: 1 }
					],
					[
						{ elementName: "foo", index: 1 },
						{ elementName: "rep", index: 0 },
						{ elementName: "ms", index: 0 },
						{ elementName: "value", index: 1 }
					]
				]
			: [],
		rulePath: "some/rule/path",
		severity: "ERROR"
	};
}

function expandedTestError(): Message {
	const testErrorMessage = testError(true);
	return {
		...testErrorMessage,
		referencedFields: [
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "bar", index: 1 }
			],
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "rep", index: 1 },
				{ elementName: "rep2", index: 1 },
				{ elementName: "field", index: 1 }
			],
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "rep", index: 1 },
				{ elementName: "rep2", index: 2 },
				{ elementName: "field", index: 1 }
			],
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "rep", index: 2 },
				{ elementName: "rep2", index: 1 },
				{ elementName: "field", index: 1 }
			],
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "rep", index: 2 },
				{ elementName: "rep2", index: 2 },
				{ elementName: "field", index: 1 }
			],
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "baz", index: 1 }
			],
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "rep", index: 1 },
				{ elementName: "ms", index: 0 },
				{ elementName: "value", index: 1 }
			],
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "rep", index: 2 },
				{ elementName: "ms", index: 0 },
				{ elementName: "value", index: 1 }
			]
		],
		refOmissionErrorResponsible: [
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "bar", index: 1 }
			],
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "rep", index: 1 },
				{ elementName: "rep2", index: 1 },
				{ elementName: "field", index: 1 }
			],
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "rep", index: 1 },
				{ elementName: "rep2", index: 2 },
				{ elementName: "field", index: 1 }
			],
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "rep", index: 2 },
				{ elementName: "rep2", index: 1 },
				{ elementName: "field", index: 1 }
			],
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "rep", index: 2 },
				{ elementName: "rep2", index: 2 },
				{ elementName: "field", index: 1 }
			],
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "baz", index: 1 }
			],
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "rep", index: 1 },
				{ elementName: "ms", index: 0 },
				{ elementName: "value", index: 1 }
			],
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "rep", index: 2 },
				{ elementName: "ms", index: 0 },
				{ elementName: "value", index: 1 }
			]
		]
	};
}

function dmTestInstance(): DocumentModel {
	return {
		header: {} as unknown as DocumentModel["header"],
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
						name: "foo",
						elements: [
							{
								id: "bar",
								name: "bar",
								fieldType: {
									type: "StringType"
								},
								type: "Field"
							},
							{
								id: "baz",
								name: "baz",
								fieldType: {
									type: "StringType"
								},
								type: "Field"
							},
							{
								id: "rep",
								name: "rep",
								type: "Group",
								elements: [
									{
										id: "rep2",
										name: "rep2",
										type: "Group",
										elements: [
											{
												id: "field",
												name: "field",
												fieldType: {
													type: "StringType"
												},
												type: "Field"
											}
										],
										repeatability: 10
									},
									{
										id: "ms",
										name: "ms",
										type: "Group",
										usageType: "multi-select",
										elements: [
											{
												id: "value",
												name: "value",
												fieldType: {
													type: "StringType"
												},
												type: "Field"
											}
										],
										repeatability: 999
									}
								],
								repeatability: 10
							}
						]
					}
				]
			},
			documentUniquenessCriteria: []
		}
	};
}
