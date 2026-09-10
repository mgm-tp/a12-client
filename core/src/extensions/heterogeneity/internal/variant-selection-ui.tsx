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

import { useContext, type JSX } from "react";
import { ThemeProvider, useTheme } from "styled-components";

import type { DefaultThemeType } from "@com.mgmtp.a12.widgets/widgets-core/lib/theme/schema.js";

import { ClientWidgetMapContext } from "../../../core/ClientWidgetMap.js";

import type { VariantSelectionItem } from "./variant-selection-mapper.js";

/**
 * @experimental
 * Props of VariantSelection
 */
export interface VariantSelectionProps {
	/**
	 * (Top level) variants to be displayed. Nested variants must be included
	 * as children inside their parent variant.
	 *
	 * Only variants that have documentModelId are selectable.
	 */
	readonly variants: VariantSelectionItem[];

	/**
	 * Called if a variant is selected (clicked).
	 * @param documentModelId ID of the clicked document model
	 */
	onSelect(documentModelId: string): void;
}

/**
 * @experimental
 *
 * Default UI to display variants in a simple, static tree.
 *
 * Uses components from the Tree Widget.
 */
export function VariantSelection(props: VariantSelectionProps): JSX.Element {
	const theme = useTheme() as DefaultThemeType;

	const { TreeContainer } = useContext(ClientWidgetMapContext);

	const customTheme: DefaultThemeType = {
		...theme,
		components: {
			...theme.components,
			contentBox: {
				...theme.components.contentBox,
				contentBoxHorizontalPadding: "0px"
			},
			tree: {
				...theme.components.tree,
				node: {
					...theme.components.tree.node,
					titleSpacingLeft: "0px"
				}
			}
		}
	};

	return (
		<ThemeProvider theme={customTheme}>
			<TreeContainer>
				{props.variants.map((variant, index) => (
					<VariantTreeNode variant={variant} onSelect={props.onSelect} level={0} key={index} />
				))}
			</TreeContainer>
		</ThemeProvider>
	);
}

VariantSelection.whyDidYouRender = true;

interface VariantTreeNodeProps {
	readonly level: number;
	readonly variant: VariantSelectionItem;
	onSelect(dataModel: string): void;
}

function VariantTreeNode(props: VariantTreeNodeProps): JSX.Element {
	const { TreeNode, Icon } = useContext(ClientWidgetMapContext);

	const documentModelId = props.variant.documentModelId;
	const isSelectable = documentModelId !== undefined;

	const onTitleClick = isSelectable
		? () => {
				props.onSelect(documentModelId);
			}
		: undefined;

	const children = props.variant.children?.map((variant, index) => (
		<VariantTreeNode
			variant={variant}
			onSelect={props.onSelect}
			level={props.level + 1}
			key={index}
		/>
	));

	return (
		<TreeNode
			label={props.variant.label}
			onTitleClick={onTitleClick}
			focusable={isSelectable}
			interactive={isSelectable}
			level={props.level}
			icon={<Icon>arrow_right</Icon>}
		>
			{children}
		</TreeNode>
	);
}

VariantTreeNode.whyDidYouRender = true;
