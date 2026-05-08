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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import { deepStrictEqual, strictEqual } from "node:assert/strict";

import type { Model } from "@com.mgmtp.a12.client/client-core";
import type { Message } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { expandComputedFields } from "../../data-mutation/validation-computation/expandComputedFields.js";

describe("data-mutation.validation", () => {
	describe("expandComputedFields", () => {
		it("when given a list of messages without computed fields in the referenced fields, returns the given messages", () => {
			const messages = [testError()];
			const result = expandComputedFields(messages, dm());
			strictEqual(result, messages);
		});

		it("when given a list of messages with computed fields in the referenced fields, returns the messages with all related non-computed (operand) fields", () => {
			const result = expandComputedFields([testError()], dm(), {
				"/foo/comp": ["/foo/nonComp1", "/foo/rep/nonComp2"]
			});
			deepStrictEqual(result, [expandedComputedFieldsTestError()]);
		});

		it("when given a list of messages with computed fields in the referenced fields and 'replace' mode, returns the messages with all related non-computed (operand) fields but without the computed fields", () => {
			const result = expandComputedFields(
				[testError()],
				dm(),
				{
					"/foo/comp": ["/foo/nonComp1", "/foo/rep/nonComp2"]
				},
				"replace"
			);
			deepStrictEqual(result, [
				{
					...testError(),
					referencedFields: [
						[
							{ elementName: "foo", index: 1 },
							{ elementName: "nonComp1", index: 1 }
						],
						[
							{ elementName: "foo", index: 1 },
							{ elementName: "rep", index: 0 },
							{ elementName: "nonComp2", index: 1 }
						]
					],
					refOmissionErrorResponsible: [
						[
							{ elementName: "foo", index: 1 },
							{ elementName: "nonComp1", index: 1 }
						],
						[
							{ elementName: "foo", index: 1 },
							{ elementName: "rep", index: 0 },
							{ elementName: "nonComp2", index: 1 }
						]
					]
				}
			]);
		});
	});
});

function dm(): Model.DocumentAndValidationModel {
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
						name: "foo",
						elements: [
							{
								id: "comp",
								name: "comp",
								fieldType: {
									type: "NumberType"
								},
								type: "Field"
							},
							{
								id: "nonComp1",
								name: "nonComp1",
								fieldType: {
									type: "NumberType"
								},
								type: "Field"
							},
							{
								id: "rep",
								type: "Group",
								repeatability: 5,
								name: "rep",
								elements: [
									{
										id: "nonComp2",
										name: "nonComp2",
										fieldType: {
											type: "NumberType"
										},
										type: "Field"
									}
								]
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

function testError(): Message {
	return {
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
		referencedFields: [
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "comp", index: 1 }
			]
		],
		refOmissionErrorResponsible: [
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "comp", index: 1 }
			]
		],
		rulePath: "some/rule/path",
		severity: "ERROR"
	};
}

function expandedComputedFieldsTestError(): Message {
	return {
		...testError(),
		referencedFields: [
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "nonComp1", index: 1 }
			],
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "rep", index: 0 },
				{ elementName: "nonComp2", index: 1 }
			],
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "comp", index: 1 }
			]
		],
		refOmissionErrorResponsible: [
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "nonComp1", index: 1 }
			],
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "rep", index: 0 },
				{ elementName: "nonComp2", index: 1 }
			],
			[
				{ elementName: "foo", index: 1 },
				{ elementName: "comp", index: 1 }
			]
		]
	};
}
