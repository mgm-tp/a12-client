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

import type { JSX, KeyboardEvent } from "react";
import { useContext, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react";
import type { MenuItem } from "@com.mgmtp.a12.widgets/widgets-core";

import { ClientWidgetMapContext } from "../../../ClientWidgetMap.js";
import type { DynamicMenu } from "../../../configurationNG/index.js";
import { DynamicModelSelectors } from "../../../configurationNG/internal/dynamicSelectors.js";

import type { MainMenuProps } from "./MainMenu.js";

/**
 * @internal
 * Dynamic Main menu component.
 *
 * On selection of a menu item, starts a new activity using the menu state as descriptor.
 *
 * Also cancels any other running top level activity.
 *
 * Furthermore the component implements a tab circle between the button, which opens
 * the menu, the menu and the elements in the header.
 */
export function DynamicMainMenu(props: MainMenuProps): JSX.Element {
	const items = useMenuItems(props.onMenuItemClick);

	const { SlidingMenuWrapper, SlidingMenu, FlyoutMenu } = useContext(ClientWidgetMapContext);

	/**
	 * Focus the sliding menu wrapper when the sliding
	 * menu gets expanded.
	 * This is necessary for A11Y reasons and to create the tab circle.
	 */
	const slidingMenuWrapper = useRef<HTMLElement | null>(null);
	useEffect(() => {
		if (props.expanded === true) {
			setTimeout(() => slidingMenuWrapper.current?.focus(), 300);
		}
	}, [props.expanded]);

	/**
	 * Focus the trigger element (e.g. the sandwich button) when
	 * the user tabs out of the menu
	 */
	function handleTabOut(event: KeyboardEvent<HTMLElement>): void {
		event.preventDefault();
		props.triggerElement?.current?.focus();
	}

	return props.mobileMode ? (
		<SlidingMenuWrapper expanded={props.expanded}>
			<SlidingMenu
				items={items}
				useAs="main"
				onTabOut={handleTabOut}
				wrapperRef={ref => {
					slidingMenuWrapper.current = ref;
				}}
			/>
		</SlidingMenuWrapper>
	) : (
		<FlyoutMenu type="horizontal" items={items} useAs="main" />
	);
}

function useMenuItems(onMenuItemClick: MainMenuProps["onMenuItemClick"]): MenuItem[] {
	const dispatch = useDispatch();
	const { localizer } = useContext(LocalizerContext);

	const menus = useSelector(DynamicModelSelectors.dynamicMenus());

	return useMemo(() => {
		const createMenuItem = (treeItem: DynamicMenu): MenuItem => {
			return {
				id: treeItem.id,
				label: localizer(treeItem.label),
				selected: treeItem.selected,
				onClick: treeItem.action
					? () => {
							onMenuItemClick();
							treeItem.action?.(dispatch);
						}
					: undefined,
				items: treeItem.children?.map(createMenuItem)
			};
		};
		return menus.map(createMenuItem);
	}, [menus, localizer, onMenuItemClick, dispatch]);
}

DynamicMainMenu.whyDidYouRender = true;
