// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useCallback, useState } from "react";

import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";
import type {
	BaseTreeTableColumnType,
	TreeTableRowEventHandlers,
	TreeTableRowStyling
} from "@com.mgmtp.a12.widgets/widgets-core/lib/tree-table/main/tree-table.api.js";
import { TreeTable } from "@com.mgmtp.a12.widgets/widgets-core/lib/tree-table/main/tree-table.view.js";
import { TreeContainer } from "@com.mgmtp.a12.widgets/widgets-core/lib/tree/main/tpl/tree-elements.tpl.js";

import type { DependencyTreeTableNode } from "./treeTableNode.js";

declare const __DEPENDENCY_TREE_ROOT__: DependencyTreeTableNode | undefined;

const rootNode =
	typeof __DEPENDENCY_TREE_ROOT__ !== "undefined" ? __DEPENDENCY_TREE_ROOT__ : undefined;

const dependencyColumns: BaseTreeTableColumnType[] = [
	{
		label: "Package Name",
		hierarchical: true
	},
	{
		label: "Version"
	}
];

export function DependencyTreeTable(): JSX.Element {
	const [collapsedNodes, setCollapsedNodes] = useState(createNodeMap);
	const rowEventHandlers: TreeTableRowEventHandlers = useCallback(({ row }) => {
		return {
			onArrowClick() {
				setCollapsedNodes(currentCollapsedNodes => ({
					...currentCollapsedNodes,
					[row.id]: !currentCollapsedNodes[row.id]
				}));
			}
		};
	}, []);

	const rowStyling: TreeTableRowStyling = useCallback(
		({ row }) => {
			return { collapsed: collapsedNodes[row.id] };
		},
		[collapsedNodes]
	);

	return (
		<TreeContainer fitToParent>
			<TreeTable
				root={rootNode}
				columns={dependencyColumns}
				rowEventHandlers={rowEventHandlers}
				rowStyling={rowStyling}
			/>
		</TreeContainer>
	);
}

function createNodeMap(): Record<string, boolean> {
	return rootNode
		? collectIds(rootNode).reduce(
				(nodeMap, id) => {
					nodeMap[id] = false;
					return nodeMap;
				},
				{} as Record<string, boolean>
			)
		: {};
}

function collectIds(node: DependencyTreeTableNode): string[] {
	return [node.id, ...(node.children?.flatMap(collectIds) ?? [])];
}

export interface VersionInfoProps {
	readonly version: string;
	readonly currentVersionLabel: string;
	readonly ariaLevel?: number;
}

export function VersionInfo(props: VersionInfoProps): JSX.Element {
	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title
					text={`${props.currentVersionLabel}: ${props.version}`}
					ariaLevel={props.ariaLevel}
				/>
			}
			padding={false}
		>
			<DependencyTreeTable />
		</ActionContentbox>
	);
}
