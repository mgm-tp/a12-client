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

import type { ApplicationModel } from "../../../../core/model/index.js";
import {
	addModules,
	addRegions,
	removeModules
} from "../../../../core/model/internal/moduleAppModel.js";

describe("core.application", () => {
	describe("app-model.merging", () => {
		describe("addRegions", () => {
			const emptyRoot = makeRegion("ROOT");
			const tree1 = nestRegion(
				emptyRoot,
				makeRegion("sub_1.1"),
				nestRegion(makeRegion("sub_1.2"), makeRegion("sub_1.2.1"))
			);

			const tree2 = nestRegion(emptyRoot, makeRegion("sub_1.3"));

			it("adds new sub-trees to empty tree", () => {
				const result = addRegions(tree1, emptyRoot);
				deepStrictEqual(result, tree1);
			});

			it("adds new sub-trees to populated tree", () => {
				const result = addRegions(tree2, tree1);
				const merged = nestRegion(tree1, makeRegion("sub_1.3"));

				deepStrictEqual(result, merged);
			});

			it("skips equal (empty)", () => {
				const result = addRegions(emptyRoot, emptyRoot);
				deepStrictEqual(result, emptyRoot);
			});

			it("skips equal (nested)", () => {
				const result = addRegions(tree1, tree1);
				deepStrictEqual(result, tree1);
			});
		});

		const emptyModules: readonly ApplicationModel.Module[] = [];
		const module1 = makeModule("module1");
		const module2 = makeModule("module2");
		const module3 = makeModule("module3");
		const allModules = [module1, module2, module3];

		describe("addModules", () => {
			it("adds modules in the order of appearance", () => {
				deepStrictEqual(
					addModules([module1, module2], emptyModules),
					[module1, module2],
					"initially empty"
				);
				deepStrictEqual(
					addModules([module2], [module1]),
					[module1, module2],
					"initially populated"
				);
			});
		});

		describe("removeModules", () => {
			it("removes modules conserving the order", () => {
				deepStrictEqual(removeModules([module1, module2], emptyModules), [], "initially empty");
				deepStrictEqual(
					removeModules([module1], allModules),
					[module2, module3],
					"initially populated 1"
				);
				deepStrictEqual(
					removeModules([module2], allModules),
					[module1, module3],
					"initially populated 2"
				);
				deepStrictEqual(
					removeModules([module3], allModules),
					[module1, module2],
					"initially populated 3"
				);
			});
		});
	});
});

function makeModule(name: string): ApplicationModel.Module {
	return {
		name,
		flows: [],
		menu: {
			name
		}
	};
}

function makeRegion(name: string): ApplicationModel.Region {
	return {
		name,
		layout: { name: `${name}-layout` }
	};
}

function nestRegion(
	parent: ApplicationModel.Region,
	...subRegions: ApplicationModel.Region[]
): ApplicationModel.Region {
	const resultSubRegions = subRegions.length > 0 ? subRegions : parent.subRegions;
	return resultSubRegions
		? {
				...parent,
				subRegions: merge(parent.subRegions, subRegions)
			}
		: parent;
}

function merge(
	left?: ApplicationModel.Region[],
	right?: ApplicationModel.Region[]
): ApplicationModel.Region[] | undefined {
	if (left === undefined || left.length === 0) {
		return right;
	}
	if (right === undefined || right.length === 0) {
		return left;
	}
	return [...left, ...right];
}
