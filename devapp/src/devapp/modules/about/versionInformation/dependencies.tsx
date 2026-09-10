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
