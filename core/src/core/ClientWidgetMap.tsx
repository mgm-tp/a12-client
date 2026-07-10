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

import { createContext, type ComponentType } from "react";

import {
	type ApplicationHeaderProps,
	ApplicationHeader,
	type ButtonGroupProps,
	ButtonGroup,
	type ButtonProps,
	Button,
	type HeaderTriggerProps,
	HeaderTrigger,
	type ActionContentboxProps,
	ActionContentbox,
	type ContentBoxProps,
	ContentBoxElements,
	type IconProps,
	Icon,
	type LabelProps,
	Label,
	type SelectProps,
	Select,
	type ApplicationFrameProps,
	ApplicationFrame,
	type LayoutGridProps,
	LayoutGrid,
	type MasterDetailProps,
	MasterDetail,
	type ListItemProps,
	type ListProps,
	List,
	type FlyoutMenuProps,
	FlyoutMenu,
	type SlidingMenuProps,
	SlidingMenu,
	type ModalNotificationProps,
	ModalNotification,
	type ModalOverlayProps,
	ModalOverlay,
	type PopUpMenuProps,
	PopUpMenu,
	type ProgressIndicatorProps,
	ProgressIndicator,
	type TextOutputProps,
	TextOutput,
	type ToastGroupProps,
	ToastGroup,
	type ToastProps,
	Toast,
	TreeContainer,
	TreeNode,
	type TreeContainerProps,
	type TreeNodeProps
} from "@com.mgmtp.a12.widgets/widgets-core";

/**
 * Set of A12 Widgets rendered by Client that can be replaced by custom components.
 *
 * Note that this map will only be expanded as needed
 */
export interface ClientWidgetMap {
	readonly ApplicationFrame: ComponentType<ApplicationFrameProps>;
	readonly ApplicationHeader: ComponentType<ApplicationHeaderProps>;
	readonly Button: ComponentType<ButtonProps>;
	readonly ButtonGroup: ComponentType<ButtonGroupProps>;
	readonly Icon: ComponentType<IconProps>;
	readonly MasterDetail: ComponentType<MasterDetailProps>;
	readonly ModalNotification: ComponentType<ModalNotificationProps>;
	readonly ModalOverlay: ComponentType<ModalOverlayProps>;
	readonly ProgressIndicator: ComponentType<ProgressIndicatorProps>;
	readonly Grid: ComponentType<LayoutGridProps.LayoutGridProps>;
	readonly Column: ComponentType<LayoutGridProps.ColumnProps>;
	readonly Row: ComponentType<LayoutGridProps.RowProps>;
	readonly Toast: ComponentType<ToastProps>;
	readonly ToastGroup: ComponentType<ToastGroupProps>;
	readonly TreeContainer: ComponentType<TreeContainerProps>;
	readonly TreeNode: ComponentType<TreeNodeProps>;
	readonly Select: ComponentType<SelectProps>;
	readonly FlyoutMenu: ComponentType<FlyoutMenuProps>;
	readonly SlidingMenu: ComponentType<SlidingMenuProps>;
	readonly SlidingMenuWrapper: ComponentType<SlidingMenuProps.MainWrapperProps>;
	readonly ActionContentbox: ComponentType<ActionContentboxProps>;
	readonly ContentBoxTitle: ComponentType<ContentBoxProps.TitleProps>;
	readonly ContentBoxHeading: ComponentType<ContentBoxProps.HeadingProps>;
	readonly ContentBoxBackButton: ComponentType<ContentBoxProps.BackButtonProps>;
	readonly ContentBoxCloseButton: ComponentType<ContentBoxProps.CloseButtonProps>;
	readonly TextOutput: ComponentType<TextOutputProps>;
	readonly Label: ComponentType<LabelProps>;
	readonly PopUpMenu: ComponentType<PopUpMenuProps>;
	readonly HeaderTrigger: ComponentType<HeaderTriggerProps>;
	readonly List: ComponentType<ListProps>;
	readonly ListItem: ComponentType<ListItemProps>;
}

const DefaultClientWidgetMap = {
	ApplicationFrame,
	ApplicationHeader,
	Button,
	ButtonGroup,
	Icon,
	MasterDetail,
	ModalNotification,
	ModalOverlay,
	ProgressIndicator,
	Grid: LayoutGrid.Grid,
	Column: LayoutGrid.Column,
	Row: LayoutGrid.Row,
	Toast,
	ToastGroup,
	TreeContainer,
	TreeNode,
	Select,
	FlyoutMenu,
	SlidingMenu,
	SlidingMenuWrapper: SlidingMenu.MainWrapper,
	ActionContentbox,
	ContentBoxTitle: ContentBoxElements.Title,
	ContentBoxHeading: ContentBoxElements.Heading,
	ContentBoxBackButton: ContentBoxElements.BackButton,
	ContentBoxCloseButton: ContentBoxElements.CloseButton,
	TextOutput,
	Label,
	PopUpMenu,
	HeaderTrigger,
	List,
	ListItem: List.Item
} satisfies ClientWidgetMap;

/**
 * React context that can be used to provide a custom set of A12 Widgets.
 */
export const ClientWidgetMapContext = createContext<ClientWidgetMap>(DefaultClientWidgetMap);
