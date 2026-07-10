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
import { mock } from "node:test";

import type { FieldInstanceValue } from "@com.mgmtp.a12.kernel/kernel-md-facade";

import { ElementStateUtil } from "../../../../core/api/model/relevance/elementState.js";
import type { FieldCondition } from "../../../../core/api/model/relevance/notRelevantConfig.js";

describe("core.api.evaluateConfigEntry", () => {
	describe("negate === undefined", () => {
		describe("no cases given", () => {
			it("returns false", () => {
				const CONFIG_ENTRY = { cases: [] };
				const result = ElementStateUtil.evaluateConfigEntry(CONFIG_ENTRY, [], () => "trigger");

				strictEqual(result, false);
			});
		});

		describe("one case given", () => {
			describe("with no conditions", () => {
				it("returns true", () => {
					const CONFIG_ENTRY = { cases: [{ conditions: [] }] };
					const result = ElementStateUtil.evaluateConfigEntry(CONFIG_ENTRY, [], () => "trigger");

					strictEqual(result, true);
				});
			});

			describe("with conditions", () => {
				it("returns false if only some conditions match", () => {
					const CONFIG_ENTRY = {
						cases: [
							{
								conditions: [condition("field", "trigger"), condition("anotherField", null)]
							}
						]
					};
					const result = ElementStateUtil.evaluateConfigEntry(CONFIG_ENTRY, [], () => "trigger");

					strictEqual(result, false);
				});

				it("returns true if all conditions match", () => {
					const CONFIG_ENTRY = {
						cases: [
							{
								conditions: [
									condition("string", "trigger"),
									condition("number", 5),
									condition("boolean", false),
									condition("confirm", null)
								]
							}
						]
					};
					const result = ElementStateUtil.evaluateConfigEntry(CONFIG_ENTRY, [], path => {
						const fieldName = path.at(-1)?.elementName;

						switch (fieldName) {
							case "string":
								return "trigger";
							case "number":
								return 5;
							case "boolean":
								return false;
							case "confirm":
								// use undefined here to show that undefined and null match
								return undefined;
							default:
								return "unknown field";
						}
					});

					strictEqual(result, true);
				});
			});
		});

		describe("multiple cases given", () => {
			it("returns false if no cases match", () => {
				const CONFIG_ENTRY = {
					cases: [
						{
							conditions: [condition("string", "trigger")]
						},
						{
							conditions: [condition("string", "alsoTrigger")]
						}
					]
				};
				const result = ElementStateUtil.evaluateConfigEntry(CONFIG_ENTRY, [], () => "notTrigger");

				strictEqual(result, false);
			});

			it("returns true if at least one case matches", () => {
				const CONFIG_ENTRY = {
					cases: [
						{
							conditions: [condition("string", "trigger")]
						},
						{
							conditions: [condition("string", "alsoTrigger")]
						}
					]
				};
				const result = ElementStateUtil.evaluateConfigEntry(CONFIG_ENTRY, [], () => "trigger");

				strictEqual(result, true);
			});
		});
	});

	describe("negate === true", () => {
		it("returns true if the config entry evaluated to false", () => {
			const CONFIG_ENTRY = {
				negate: true as const,
				cases: [
					{
						conditions: [condition("field", "trigger")]
					}
				]
			};
			const result = ElementStateUtil.evaluateConfigEntry(CONFIG_ENTRY, [], () => "notTrigger");

			strictEqual(result, true);
		});

		it("returns false if the config entry evaluated to true", () => {
			const CONFIG_ENTRY = {
				negate: true as const,
				cases: [
					{
						conditions: [condition("field", "trigger")]
					}
				]
			};
			const result = ElementStateUtil.evaluateConfigEntry(CONFIG_ENTRY, [], () => "trigger");

			strictEqual(result, false);
		});
	});

	it("calls getValue with the correct document path", () => {
		const getValueSpy = mock.fn();

		const CONFIG_ENTRY = {
			cases: [
				{
					conditions: [
						{
							fieldPath: [
								{ elementName: "root" },
								{ elementName: "GroupA" },
								{ elementName: "GroupB" },
								{ elementName: "GroupC" },
								{ elementName: "triggerField" }
							],
							value: "trigger"
						}
					]
				}
			]
		};
		ElementStateUtil.evaluateConfigEntry(
			CONFIG_ENTRY,
			[
				{ elementName: "root", index: 1 },
				{ elementName: "GroupA", index: 3 },
				{ elementName: "GroupB", index: 1 },
				{ elementName: "GroupC", index: 7 },
				{ elementName: "GroupD", index: 1 },
				{ elementName: "dependentField", index: 1 }
			],
			getValueSpy
		);

		strictEqual(getValueSpy.mock.calls.length, 1);
		deepStrictEqual(getValueSpy.mock.calls[0].arguments, [
			[
				{ elementName: "root", index: 1 },
				{ elementName: "GroupA", index: 3 },
				{ elementName: "GroupB", index: 1 },
				{ elementName: "GroupC", index: 7 },
				{ elementName: "triggerField", index: 1 }
			]
		]);
	});
});

function condition(fieldName: string, value: FieldInstanceValue): FieldCondition {
	return {
		fieldPath: [{ elementName: "root" }, { elementName: fieldName }],
		value
	};
}
