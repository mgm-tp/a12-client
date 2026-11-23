// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
