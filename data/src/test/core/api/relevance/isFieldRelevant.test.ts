// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";

import type { EntityInstancePath } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

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
