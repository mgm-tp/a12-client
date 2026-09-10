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

import type { ApplicationHeaderProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/application-header/main/application-header.api.js";
import { ApplicationHeader } from "@com.mgmtp.a12.widgets/widgets-core/lib/application-header/main/application-header.view.js";
import type { ButtonGroupProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/button-group/main/button-group.api.js";
import { ButtonGroup } from "@com.mgmtp.a12.widgets/widgets-core/lib/button-group/main/button-group.view.js";
import type { ButtonProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.api.js";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import type { HeaderTriggerProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/header-trigger/header-trigger.api.js";
import { HeaderTrigger } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/header-trigger/header-trigger.view.js";
import type { ActionContentboxProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.api.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import type { ContentBoxProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.api.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";
import type { IconProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/icon/main/icon.api.js";
import { Icon } from "@com.mgmtp.a12.widgets/widgets-core/lib/icon/main/icon.view.js";
import type { LabelProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/input/base/template/base.tpl.api.js";
import { Label } from "@com.mgmtp.a12.widgets/widgets-core/lib/input/base/template/base.tpl.view.js";
import type { SelectProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/input/select/main/select.api.js";
import { Select } from "@com.mgmtp.a12.widgets/widgets-core/lib/input/select/main/select.view.js";
import type { ApplicationFrameProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/application-frame/main/application-frame.api.js";
import { ApplicationFrame } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/application-frame/main/application-frame.view.js";
import type { LayoutGridProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.api.js";
import { LayoutGrid } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.view.js";
import type { MasterDetailProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/master-detail/main/master-detail.api.js";
import { MasterDetail } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/master-detail/main/master-detail.view.js";
import type {
	ListItemProps,
	ListProps
} from "@com.mgmtp.a12.widgets/widgets-core/lib/list/main/list.api.js";
import { List } from "@com.mgmtp.a12.widgets/widgets-core/lib/list/main/list.view.js";
import type { FlyoutMenuProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/menu/main/flyout-menu.api.js";
import { FlyoutMenu } from "@com.mgmtp.a12.widgets/widgets-core/lib/menu/main/flyout-menu.view.js";
import type { SlidingMenuProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/menu/main/sliding-menu.api.js";
import { SlidingMenu } from "@com.mgmtp.a12.widgets/widgets-core/lib/menu/main/sliding-menu.view.js";
import type { ModalNotificationProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/modal-notification/main/modal-notification.api.js";
import { ModalNotification } from "@com.mgmtp.a12.widgets/widgets-core/lib/modal-notification/main/modal-notification.view.js";
import type { ModalOverlayProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/modal-overlay/main/modal-overlay.api.js";
import { ModalOverlay } from "@com.mgmtp.a12.widgets/widgets-core/lib/modal-overlay/main/modal-overlay.view.js";
import type { PopUpMenuProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/pop-up-menu/main/pop-up-menu.api.js";
import { PopUpMenu } from "@com.mgmtp.a12.widgets/widgets-core/lib/pop-up-menu/main/pop-up-menu.view.js";
import type { ProgressIndicatorProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/progress-indicator/main/progress-indicator.api.js";
import { ProgressIndicator } from "@com.mgmtp.a12.widgets/widgets-core/lib/progress-indicator/main/progress-indicator.view.js";
import type { TextOutputProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/text-output/main/text-output.api.js";
import { TextOutput } from "@com.mgmtp.a12.widgets/widgets-core/lib/text-output/main/text-output.view.js";
import type { ToastGroupProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/toast/main/toast-group.api.js";
import { ToastGroup } from "@com.mgmtp.a12.widgets/widgets-core/lib/toast/main/toast-group.view.js";
import type { ToastProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/toast/main/toast/toast.api.js";
import { Toast } from "@com.mgmtp.a12.widgets/widgets-core/lib/toast/main/toast/toast.view.js";
import {
	TreeContainer,
	TreeNode
} from "@com.mgmtp.a12.widgets/widgets-core/lib/tree/main/tpl/tree-elements.tpl.js";
import type {
	TreeContainerProps,
	TreeNodeProps
} from "@com.mgmtp.a12.widgets/widgets-core/lib/tree/main/tpl/tree.tpl.api.js";

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
