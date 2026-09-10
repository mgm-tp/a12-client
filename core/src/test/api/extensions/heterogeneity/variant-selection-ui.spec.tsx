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

import { ok, strictEqual } from "node:assert/strict";
import { mock } from "node:test";

import { query } from "@com.mgmtp.a12.devtools/react";
import { TreeNode } from "@com.mgmtp.a12.widgets/widgets-core/lib/tree/main/tpl/tree-elements.tpl.js";

import type { VariantSelectionItem } from "../../../../extensions/heterogeneity/index.js";
import { VariantSelection } from "../../../../extensions/heterogeneity/index.js";
import { render } from "../../../utils/rtl/rtl-extension.js";
import { TestWrapper } from "../../../utils/rtl/testWrapper.js";

describe("extensions.heterogeneity", () => {
	describe("variant-selection-ui", () => {
		describe("VariantSelection is a React component that", () => {
			it("renders a variant tree to a structurally identical Tree Widget tree", () => {
				// note: mock.fn() does not work here without () =>
				const treeNodeSpy = mock.fn(props => <TreeNode {...props} />);
				render(
					<TestWrapper customWidgetMap={{ TreeNode: treeNodeSpy }}>
						<VariantSelection variants={VARIANT_TREE_1} onSelect={undefined!} />
					</TestWrapper>
				);
				const treeNodes = query(treeNodeSpy).propsHistory();
				const [rootNode, child1, child2] = treeNodes;

				strictEqual(treeNodes.length, 3);
				strictEqual(rootNode.children.length, 2);

				strictEqual(rootNode.label, "Root.label");
				strictEqual(rootNode.onTitleClick, undefined);
				ok([false, undefined].includes(rootNode.interactive));
				ok([false, undefined].includes(rootNode.focusable));

				strictEqual(child1.label, "Child1.label");
				ok(child1.onTitleClick);
				ok(child1.interactive);
				ok(child1.focusable);

				strictEqual(child2.label, "Child2.label");
				ok(child2.onTitleClick);
				ok(child2.interactive);
				ok(child2.focusable);
			});
		});
	});
});

// A small variant tree.
//     Root
//      /\
//     /  \
// Child1 Child2
const VARIANT_TREE_1: VariantSelectionItem[] = [
	{
		label: "Root.label",
		children: [
			{
				documentModelId: "Child1",
				label: "Child1.label"
			},
			{
				documentModelId: "Child2",
				label: "Child2.label"
			}
		]
	}
];
