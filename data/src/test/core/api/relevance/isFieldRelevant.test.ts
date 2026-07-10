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

import { strictEqual } from "node:assert/strict";

import type { EntityInstancePath } from "@com.mgmtp.a12.kernel/kernel-md-facade";

import { ElementStateUtil } from "../../../../core/api/model/relevance/elementState.js";
import type { NotRelevantConfig } from "../../../../core/api/model/relevance/notRelevantConfig.js";

describe("core.api.isFieldNotRelevant", () => {
	describe("no notRelevant config given", () => {
		it("returns false", () => {
			const result = ElementStateUtil.isFieldNotRelevant(fieldDocPath(), () => "trigger");

			strictEqual(result, false);
		});
	});

	describe("one notRelevant config given", () => {
		describe("and no entry for the given field or any ancestor group", () => {
			it("returns false", () => {
				const CONFIG = {
					["/root/group/anotherField"]: {
						cases: [{ conditions: [{ fieldPath: [], value: "trigger" }] }]
					},
					["/root/anotherGroup"]: {
						cases: [{ conditions: [{ fieldPath: [], value: "trigger" }] }]
					}
				};
				const result = ElementStateUtil.isFieldNotRelevant(fieldDocPath(), () => "trigger", [
					CONFIG
				]);

				strictEqual(result, false);
			});
		});

		describe("and an entry for the given field", () => {
			it("returns false if the condition doesn't match", () => {
				const result = ElementStateUtil.isFieldNotRelevant(fieldDocPath(), () => "notTrigger", [
					simpleConfig("/root/group/field", "trigger")
				]);

				strictEqual(result, false);
			});

			it("returns true if the condition matches", () => {
				const result = ElementStateUtil.isFieldNotRelevant(fieldDocPath(), () => "trigger", [
					simpleConfig("/root/group/field", "trigger")
				]);

				strictEqual(result, true);
			});
		});

		describe("and an entry for an ancestor group of the given field", () => {
			it("returns false if the condition doesn't match", () => {
				const result = ElementStateUtil.isFieldNotRelevant(fieldDocPath(), () => "notTrigger", [
					simpleConfig("/root/group", "trigger")
				]);

				strictEqual(result, false);
			});

			it("returns true if the condition matches", () => {
				const result = ElementStateUtil.isFieldNotRelevant(fieldDocPath(), () => "trigger", [
					simpleConfig("/root/group", "trigger")
				]);

				strictEqual(result, true);
			});
		});
	});

	describe("multiple notRelevant configs given", () => {
		it("returns false if no config has a matching case", () => {
			const result = ElementStateUtil.isFieldNotRelevant(fieldDocPath(), () => "notTrigger", [
				simpleConfig("/root/group/field", "trigger"),
				simpleConfig("/root/group/field", "alsoTrigger")
			]);

			strictEqual(result, false);
		});

		it("returns true if at least one config has a matching case", () => {
			const result = ElementStateUtil.isFieldNotRelevant(fieldDocPath(), () => "alsoTrigger", [
				simpleConfig("/root/group/field", "trigger"),
				simpleConfig("/root/group", "alsoTrigger")
			]);

			strictEqual(result, true);
		});
	});
});

function fieldDocPath(): EntityInstancePath {
	return [
		{ elementName: "root", index: 1 },
		{ elementName: "group", index: 1 },
		{ elementName: "field", index: 1 }
	];
}

function simpleConfig(path: string, triggerValue: string): NotRelevantConfig {
	return {
		[path]: {
			cases: [{ conditions: [{ fieldPath: [], value: triggerValue }] }]
		}
	};
}
