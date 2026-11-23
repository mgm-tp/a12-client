// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
