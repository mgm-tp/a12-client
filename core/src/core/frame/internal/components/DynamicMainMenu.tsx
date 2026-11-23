// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX, KeyboardEvent } from "react";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import type { MenuItem } from "@com.mgmtp.a12.widgets/widgets-core/lib/menu/main/menu.api.js";

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

	const createMenuItem = useCallback(
		(treeItem: DynamicMenu): MenuItem => {
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
		},
		[dispatch, localizer, onMenuItemClick]
	);

	return useMemo(() => menus.map(createMenuItem), [menus, createMenuItem]);
}

DynamicMainMenu.whyDidYouRender = true;
