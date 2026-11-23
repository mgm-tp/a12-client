// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";

import { DataReference } from "../../../core/api/data-reference.js";

describe("core.api.DataReference", () => {
	describe("resolveWithIndex", () => {
		it("Extends the given data reference with the given element name and index", () => {
			const dataRef = "/root[1]/someGroup/[1]/anotherGroup[5]";
			const elementName = "foo";
			const index = 7;

			strictEqual(
				DataReference.resolveWithIndex(dataRef, elementName, index),
				`/root[1]/someGroup/[1]/anotherGroup[5]/${elementName}[${index}]`
			);
		});
	});

	describe("resolve", () => {
		it("Extends the given data reference with the given element name", () => {
			const dataRef = "/root[1]/someGroup/[1]/anotherGroup[5]";
			const elementName = "foo";

			strictEqual(
				DataReference.resolve(dataRef, elementName),
				`/root[1]/someGroup/[1]/anotherGroup[5]/${elementName}`
			);
		});
	});
});
