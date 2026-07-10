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

import { ModelPath } from "@com.mgmtp.a12.base/base-model-api";
import type { EntityInstancePath, Message } from "@com.mgmtp.a12.kernel/kernel-md-facade";

import { DocumentPath } from "../../core/api/path/documentPath.js";
import { KernelMessage } from "../../data-mutation/validation-computation/message.js";
import { removeOutdatedMessages } from "../../data-mutation/validation-computation/removeOutdatedMessages.js";

describe("data-mutation.validation", () => {
	describe("removeOutdatedMessages", () => {
		it("when given no validation data, returns an empty validation data object", () => {
			let result = removeOutdatedMessages({}, "field");
			deepStrictEqual(result, {});

			result = removeOutdatedMessages({}, "partial");
			deepStrictEqual(result, {});

			result = removeOutdatedMessages({}, "full");
			deepStrictEqual(result, {});
		});

		describe("full validation", () => {
			it("keeps formal errors and error values", () => {
				const errorValues = {
					"/foo[1]/bar[1]": "foo",
					"/foo[2]/bar[1]": "foo",
					"/foo[3]/bar[1]": "foo",
					"/foo[4]/bar[1]": "foo"
				};
				const result = removeOutdatedMessages(
					{
						"foo/1": {
							errorValues,
							messages: [testError(), testParseError(), testParseError(2), testError()]
						}
					},
					"full"
				);

				deepStrictEqual(result, {
					"foo/1": {
						errorValues,
						messages: [testParseError(), testParseError(2)]
					}
				});
			});
		});

		describe("partial validation", () => {
			it("keeps formal errors for fields that are relevant in the next validation and keeps all error values", () => {
				const errorValues = {
					"/foo[1]/bar[1]": "foo",
					"/foo[2]/bar[1]": "foo",
					"/foo[3]/bar[1]": "foo",
					"/foo[4]/bar[1]": "foo"
				};

				const validationData = {
					"foo/1": {
						errorValues,
						messages: [testError(), testParseError(), testParseError(2), testError()]
					}
				};

				let result = removeOutdatedMessages(validationData, "partial", {});

				deepStrictEqual(result, {
					"foo/1": {
						errorValues,
						messages: []
					}
				});

				result = removeOutdatedMessages(validationData, "partial", { "foo/1": ["/foo[2]/bar[1]"] });

				deepStrictEqual(result, {
					"foo/1": {
						errorValues,
						messages: [testParseError(2)]
					}
				});

				result = removeOutdatedMessages(validationData, "partial", { "foo/1": ["/foo[0]"] });

				deepStrictEqual(result, {
					"foo/1": {
						errorValues,
						messages: [testParseError(), testParseError(2)]
					}
				});
			});
		});

		describe("field", () => {
			it("returns the validation data unchanged if there are no messages or error values for validation relevant fields, no non-relevant fields and no removed rows", () => {
				const validationData = {
					"foo/1": {
						errorValues: {
							"/foo[1]/bar[1]": "foo",
							"/foo[2]/bar[1]": "foo",
							"/foo[3]/bar[1]": "foo",
							"/foo[4]/bar[1]": "foo"
						},
						messages: [testError(), testParseError(), testParseError(2), testError()]
					}
				};

				const result = removeOutdatedMessages(validationData, "field", {
					"foo/1": ["/has[1]/no[1]/message[1]"]
				});

				deepStrictEqual(result, validationData);
			});

			it("removes messages and error values for validation relevant fields", () => {
				const validationData = {
					"foo/1": {
						errorValues: {
							"/foo[1]/bar[1]": "foo",
							"/foo[2]/bar[1]": "foo",
							"/foo[3]/bar[1]": "foo",
							"/foo[4]/bar[1]": "foo"
						},
						messages: [testError(), testParseError(), testParseError(2), testError()]
					}
				};

				let result = removeOutdatedMessages(validationData, "field", {
					// should remove the errors for the first and last entry
					"foo/1": ["/foo[1]/bar[1]", "/foo[1]/rep[1]/rep2[1]/field[1]"]
				});

				deepStrictEqual(result, {
					"foo/1": {
						errorValues: {
							"/foo[2]/bar[1]": "foo",
							"/foo[3]/bar[1]": "foo",
							"/foo[4]/bar[1]": "foo"
						},
						messages: [testParseError(2)]
					}
				});

				result = removeOutdatedMessages(validationData, "field", {
					// should remove the parse error for the second entry
					// and both value errors (they reference a field from group 'rep')
					"foo/1": ["/foo[2]", "/foo[1]/rep[0]"]
				});

				deepStrictEqual(result, {
					"foo/1": {
						errorValues: {
							"/foo[1]/bar[1]": "foo",
							"/foo[3]/bar[1]": "foo",
							"/foo[4]/bar[1]": "foo"
						},
						messages: [testParseError()]
					}
				});
			});

			it("removes formal error messages and error values for computed fields", () => {
				const validationData = {
					"foo/1": {
						errorValues: {
							"/foo[1]/bar[1]": "foo",
							"/foo[2]/bar[1]": "foo",
							"/foo[1]/nonComputed[1]": "foo",
							"/foo[2]/nonComputed[1]": "foo"
						},
						messages: [testError(), testParseError(), testParseError(2), testError()]
					}
				};

				const isComputed = (path: EntityInstancePath) => {
					return ["/foo/bar"].includes(ModelPath.toString(path));
				};

				const result = removeOutdatedMessages(
					validationData,
					"field",
					{
						"foo/1": ["/has[1]/no[1]/message[1]"]
					},
					undefined,
					undefined,
					isComputed
				);

				deepStrictEqual(result, {
					"foo/1": {
						errorValues: {
							"/foo[1]/nonComputed[1]": "foo",
							"/foo[2]/nonComputed[1]": "foo"
						},
						messages: [testError(), testError()]
					}
				});
			});

			it("removes messages and error values for non-relevant fields (due to dependency)", () => {
				const validationData = {
					"foo/1": {
						errorValues: {
							"/foo[1]/bar[1]": "foo",
							"/foo[2]/bar[1]": "foo",
							"/foo[3]/bar[1]": "foo",
							"/foo[4]/bar[1]": "foo"
						},
						messages: [testError(), testParseError(), testParseError(2), testError(2), testError(0)]
					}
				};

				/**
				 * return true for index 0, because at least one instance is non-relevant
				 * => the message is outdated
				 */
				const isNotRelevant = (path: string) => {
					return ["/foo[2]/bar[1]", "/foo[0]/bar[1]"].includes(path);
				};

				const result = removeOutdatedMessages(
					validationData,
					"field",
					{
						"foo/1": ["/has[1]/no[1]/message[1]"]
					},
					undefined,
					isNotRelevant
				);

				deepStrictEqual(result, {
					"foo/1": {
						errorValues: {
							"/foo[1]/bar[1]": "foo",
							"/foo[3]/bar[1]": "foo",
							"/foo[4]/bar[1]": "foo"
						},
						messages: [testError(), testParseError()]
					}
				});
			});

			it("removes messages and error values related to removed rows and updates indices for remaining messages and error values", () => {
				const validationData = {
					"foo/1": {
						errorValues: {
							"/foo[1]/bar[1]": "foo",
							"/foo[2]/bar[1]": "foo",
							"/foo[2]/rep[4]/baz[1]": "foo",
							"/foo[5]/bar[1]": "foo",
							"/foo[5]/rep[2]/baz[1]": "foo",
							"/foo[7]/bar[1]": "foo"
						},
						messages: [
							testError(0),
							testError(),
							testParseError(),
							testError(2),
							testParseError(2),
							testError(5),
							testParseError(5),
							testError(7),
							testParseError(7)
						]
					}
				};

				const result = removeOutdatedMessages(
					validationData,
					"field",
					{
						"foo/1": ["/has[1]/no[1]/message[1]"]
					},
					// remove second row
					DocumentPath.fromString("/foo[2]")
				);

				deepStrictEqual(result, {
					"foo/1": {
						errorValues: {
							"/foo[1]/bar[1]": "foo",
							"/foo[4]/bar[1]": "foo",
							"/foo[4]/rep[2]/baz[1]": "foo",
							"/foo[6]/bar[1]": "foo"
						},
						messages: [
							testError(),
							testParseError(),
							testError(4),
							testParseError(4),
							testError(6),
							testParseError(6)
						]
					}
				});
			});
		});
	});
});

function testError(index?: number): Message {
	return {
		entityInstance: [
			{ elementName: "foo", index: index ?? 1 },
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
				{ elementName: "foo", index: index ?? 1 },
				{ elementName: "bar", index: 1 }
			],
			[
				{ elementName: "foo", index: index ?? 1 },
				{ elementName: "rep", index: 1 },
				{ elementName: "rep2", index: 1 },
				{ elementName: "field", index: 1 }
			],
			[
				{ elementName: "foo", index: index ?? 1 },
				{ elementName: "baz", index: 1 }
			]
		],
		refOmissionErrorResponsible: [
			[
				{ elementName: "foo", index: index ?? 1 },
				{ elementName: "bar", index: 1 }
			],
			[
				{ elementName: "foo", index: index ?? 1 },
				{ elementName: "rep", index: 1 },
				{ elementName: "rep2", index: 1 },
				{ elementName: "field", index: 1 }
			],
			[
				{ elementName: "foo", index: index ?? 1 },
				{ elementName: "baz", index: 1 }
			]
		],
		rulePath: "some/rule/path",
		severity: "ERROR"
	};
}

function testParseError(index?: number): Message {
	return {
		entityInstance: [
			{ elementName: "foo", index: index ?? 1 },
			{ elementName: "bar", index: 1 }
		],
		errorCode: KernelMessage.FORMAL_VALIDATION,
		errorText: [],
		messageType: "VALUE_ERROR",
		referencedFields: [
			[
				{ elementName: "foo", index: index ?? 1 },
				{ elementName: "bar", index: 1 }
			]
		],
		refOmissionErrorResponsible: [],
		rulePath: KernelMessage.FORMAL_VALIDATION,
		severity: "ERROR"
	};
}
