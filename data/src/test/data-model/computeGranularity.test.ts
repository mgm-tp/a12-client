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

import { deepStrictEqual } from "node:assert/strict";

import { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { computeGranularity } from "../../data-model/granularity.js";

import { createDocumentModel, Field, Group } from "../setup/documentModelHelpers.js";

describe("data-model.computeGranularity", () => {
	describe("computeGranularity", () => {
		describe("Given a path to a group", () => {
			describe("which is non-repeatable", () => {
				describe("and nested in a repeatable group", () => {
					it("returns the path to next repeatable ancestor group", () => {
						const granularity = computeGranularity(
							dm(),
							ModelPath.fromString("/Root/G1_nonRep/G2_rep/G3_nonRep/G4_nonRep")
						);

						deepStrictEqual(granularity, [ModelPath.fromString("/Root/G1_nonRep/G2_rep")]);
					});
				});

				describe("and nested in multiple repeatable groups", () => {
					it("returns all paths of repeatable ancestor groups", () => {
						const granularity = computeGranularity(
							dm(),
							ModelPath.fromString("/Root/G1_nonRep/G2_rep/G3_nonRep/G5_rep/G6_nonRep")
						);

						deepStrictEqual(granularity, [
							ModelPath.fromString("/Root/G1_nonRep/G2_rep"),
							ModelPath.fromString("/Root/G1_nonRep/G2_rep/G3_nonRep/G5_rep")
						]);
					});
				});

				describe("and not nested in a repeatable group", () => {
					it("returns the empty path", () => {
						const granularity = computeGranularity(dm(), ModelPath.fromString("/Root/G1_nonRep"));

						deepStrictEqual(granularity, []);
					});
				});
			});

			describe("which is repeatable", () => {
				it("returns the path to the group itself", () => {
					const granularity = computeGranularity(
						dm(),
						ModelPath.fromString("/Root/G1_nonRep/G2_rep")
					);

					deepStrictEqual(granularity, [ModelPath.fromString("/Root/G1_nonRep/G2_rep")]);
				});
			});

			describe("which is a multi-select", () => {
				it("returns the path to next repeatable ancestor group", () => {
					const granularity = computeGranularity(
						dm(),
						ModelPath.fromString("/Root/G1_nonRep/G2_rep/G3_nonRep/G3_multiSelect")
					);

					deepStrictEqual(granularity, [ModelPath.fromString("/Root/G1_nonRep/G2_rep")]);
				});
			});
		});

		describe("Given a path to a field", () => {
			describe("which is nested in a repeatable group", () => {
				it("returns the path to next repeatable ancestor group", () => {
					const granularity = computeGranularity(
						dm(),
						ModelPath.fromString("/Root/G1_nonRep/G2_rep/G3_nonRep/G3_Field")
					);

					deepStrictEqual(granularity, [ModelPath.fromString("/Root/G1_nonRep/G2_rep")]);
				});
			});

			describe("and nested in multiple repeatable groups", () => {
				it("returns all paths of repeatable ancestor groups", () => {
					const granularity = computeGranularity(
						dm(),
						ModelPath.fromString("/Root/G1_nonRep/G2_rep/G3_nonRep/G5_rep/G5_Field")
					);

					deepStrictEqual(granularity, [
						ModelPath.fromString("/Root/G1_nonRep/G2_rep"),
						ModelPath.fromString("/Root/G1_nonRep/G2_rep/G3_nonRep/G5_rep")
					]);
				});
			});

			describe("which is not nested in a repeatable group", () => {
				it("returns the empty path", () => {
					const granularity = computeGranularity(dm(), ModelPath.fromString("/Root/Root_Field"));

					deepStrictEqual(granularity, []);
				});
			});

			describe("which is a multi-select value field", () => {
				it("returns the path to next repeatable ancestor group", () => {
					const granularity = computeGranularity(
						dm(),
						ModelPath.fromString("/Root/G1_nonRep/G2_rep/G3_nonRep/G3_multiSelect/multiSelectValue")
					);

					deepStrictEqual(granularity, [ModelPath.fromString("/Root/G1_nonRep/G2_rep")]);
				});
			});
		});
	});
});

function dm(): DocumentModel {
	return createDocumentModel(
		Group({
			name: "Root",
			elements: [
				Group({
					name: "G1_nonRep",
					elements: [
						Group({
							name: "G2_rep",
							repeatability: 5,
							elements: [
								Group({
									name: "G3_nonRep",
									elements: [
										Group({ name: "G4_nonRep" }),
										Group({
											name: "G5_rep",
											repeatability: 5,
											elements: [Group({ name: "G6_nonRep" }), Field({ name: "G5_Field" })]
										}),
										Field({ name: "G3_Field" }),
										Group({
											name: "G3_multiSelect",
											repeatability: 999,
											usageType: "multi-select",
											elements: [Field({ name: "multiSelectValue" })]
										})
									]
								})
							]
						})
					]
				}),
				Field({ name: "Root_Field" })
			]
		})
	);
}
