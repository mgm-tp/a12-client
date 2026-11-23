// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";

import type { EntityInstancePath } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { ElementStateUtil } from "../../../../core/api/model/relevance/elementState.js";
import type { NotRelevantConfig } from "../../../../core/api/model/relevance/notRelevantConfig.js";

describe("core.api.isGroupNotRelevant", () => {
	describe("no notRelevant config given", () => {
		it("returns false", () => {
			const result = ElementStateUtil.isGroupNotRelevant(nestedGroupDocPath(), () => "trigger");

			strictEqual(result, false);
		});
	});

	describe("one notRelevant config given", () => {
		describe("and no entry for the given group or any ancestor group", () => {
			it("returns false", () => {
				const CONFIG = {
					["/root/group/anotherGroup"]: {
						cases: [{ conditions: [{ fieldPath: [], value: "trigger" }] }]
					},
					["/root/anotherGroup"]: {
						cases: [{ conditions: [{ fieldPath: [], value: "trigger" }] }]
					}
				};
				const result = ElementStateUtil.isGroupNotRelevant(nestedGroupDocPath(), () => "trigger", [
					CONFIG
				]);

				strictEqual(result, false);
			});
		});

		describe("and an entry for the given group", () => {
			it("returns false if the condition doesn't match", () => {
				const result = ElementStateUtil.isGroupNotRelevant(
					nestedGroupDocPath(),
					() => "notTrigger",
					[simpleConfig("/root/group/nestedGroup", "trigger")]
				);

				strictEqual(result, false);
			});

			it("returns true if the condition matches", () => {
				const result = ElementStateUtil.isGroupNotRelevant(nestedGroupDocPath(), () => "trigger", [
					simpleConfig("/root/group/nestedGroup", "trigger")
				]);

				strictEqual(result, true);
			});
		});

		describe("and an entry for an ancestor group of the given group", () => {
			it("returns false if the condition doesn't match", () => {
				const result = ElementStateUtil.isGroupNotRelevant(
					nestedGroupDocPath(),
					() => "notTrigger",
					[simpleConfig("/root/group", "trigger")]
				);

				strictEqual(result, false);
			});

			it("returns true if the condition matches", () => {
				const result = ElementStateUtil.isGroupNotRelevant(nestedGroupDocPath(), () => "trigger", [
					simpleConfig("/root/group", "trigger")
				]);

				strictEqual(result, true);
			});
		});
	});

	describe("multiple notRelevant configs given", () => {
		it("returns false if no config has a matching case", () => {
			const result = ElementStateUtil.isGroupNotRelevant(nestedGroupDocPath(), () => "notTrigger", [
				simpleConfig("/root/group/nestedGroup", "trigger"),
				simpleConfig("/root/group/nestedGroup", "alsoTrigger")
			]);

			strictEqual(result, false);
		});

		it("returns true if at least one config has a matching case", () => {
			const result = ElementStateUtil.isGroupNotRelevant(
				nestedGroupDocPath(),
				() => "alsoTrigger",
				[
					simpleConfig("/root/group/nestedGroup", "trigger"),
					simpleConfig("/root/group/nestedGroup", "alsoTrigger")
				]
			);

			strictEqual(result, true);
		});
	});
});

function nestedGroupDocPath(): EntityInstancePath {
	return [
		{ elementName: "root", index: 1 },
		{ elementName: "group", index: 1 },
		{ elementName: "nestedGroup", index: 1 }
	];
}

function simpleConfig(path: string, triggerValue: string): NotRelevantConfig {
	return {
		[path]: {
			cases: [{ conditions: [{ fieldPath: [], value: triggerValue }] }]
		}
	};
}
