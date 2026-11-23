// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX, KeyboardEvent } from "react";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { FrameViews } from "@com.mgmtp.a12.client/client-core";
import { DynamicModelSelectors, type DynamicMenu } from "@com.mgmtp.a12.client/client-core";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import { localizableFromModel } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/LocalizableFactory.js";
import type { LocalizedModelText } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/LocalizedModelText.js";
import { FlyoutMenu } from "@com.mgmtp.a12.widgets/widgets-core/lib/menu/main/flyout-menu.view.js";
import type { MenuItem } from "@com.mgmtp.a12.widgets/widgets-core/lib/menu/main/menu.api.js";
import { SlidingMenu } from "@com.mgmtp.a12.widgets/widgets-core/lib/menu/main/sliding-menu.view.js";

import { isDevelopmentMode } from "./config/development.js";

/**
 * A custom main menu component.
 *
 * It has its own model in the form of a "global" menu. This allows to define
 * the order (and nesting) of menu items. Menu items are either "container"
 * items which are used defining the menu structure. Or they are "module"
 * items, which reference module menus (from the app model).
 *
 * On selection of a menu item, starts a new activity using the menu state as
 * descriptor.
 *
 * Also cancels any other running top level activity.
 */
export function MainMenu(props: FrameViews.MainMenuProps): JSX.Element {
	const menuItems = useMenuItems(props.onMenuItemClick);

	/**
	 * Focus the sliding menu wrapper when the sliding
	 * menu gets expanded.
	 * This is necessary for A11Y reasons and to create the tab circle.
	 */
	const slidingMenuWrapper = useRef<HTMLElement | null>(null);
	useEffect(() => {
		if (props.expanded) {
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
		<SlidingMenu.MainWrapper expanded={props.expanded}>
			<SlidingMenu
				id={props.id}
				items={menuItems}
				useAs="main"
				onTabOut={handleTabOut}
				wrapperRef={r => {
					slidingMenuWrapper.current = r;
				}}
			/>
		</SlidingMenu.MainWrapper>
	) : (
		<FlyoutMenu id={props.id} type="horizontal" items={menuItems} useAs="main" />
	);
}

function useMenuItems(onMenuItemClick: FrameViews.MainMenuProps["onMenuItemClick"]) {
	const dispatch = useDispatch();

	const { localizer } = useContext(LocalizerContext);

	const menus = useSelector(DynamicModelSelectors.dynamicMenus());
	const convertedMenu = useMemo(() => convertMenuTree(mainMenu, menus), [menus]);
	// check if a module was registered we have no menu entry for
	assertMenuEntryExists(menus, convertedMenu);

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

	return useMemo(() => convertedMenu.map(createMenuItem), [convertedMenu, createMenuItem]);
}

function assertMenuEntryExists(before: DynamicMenu[], after: DynamicMenu[]) {
	before.forEach(menuBefore => {
		function contains(menuItem: DynamicMenu): boolean {
			return menuBefore.id === menuItem.id || (menuItem.children?.some(contains) ?? false);
		}
		if (!after.some(contains)) {
			throw new Error(
				`Did not find menu entry for ${menuBefore.id}. Add it to the 'mainMenu' object below.`
			);
		}
	});
}

export interface ContainerMenu {
	readonly name: string;
	readonly label: LocalizedModelText;
	readonly children?: MenuTree[];
	readonly permission?: string;
}

export function isContainerMenu(obj: MenuTree): obj is ContainerMenu {
	return !("module" in obj);
}

export interface ModuleMenu {
	readonly module: string;
	/**
	 * Specifies entries that do not always have a matching module entry.
	 */
	readonly isDynamic?: true;
	/**
	 * Specifies entries that are only visible in development mode
	 */
	readonly onlyInDevelopmentMode?: true;
}

export type MenuTree = ModuleMenu | ContainerMenu;

/** Replaces menus referencing modules with the menu definition inside of those modules */
function convertMenuTree(
	inputMenu: readonly MenuTree[],
	menus: readonly DynamicMenu[]
): DynamicMenu[] {
	return inputMenu
		.map(menuItem => {
			if (isContainerMenu(menuItem)) {
				const { name, label: modelTexts } = menuItem;

				const label = localizableFromModel(`menu.${name}`, modelTexts);

				if (menuItem.children === undefined) {
					return { id: name, label: label };
				}

				const children =
					menuItem.children !== undefined ? convertMenuTree(menuItem.children, menus) : undefined;

				// Drop empty menu entries that are caused due to missing permissions of the user
				if (children !== undefined && children.length === 0) {
					return undefined;
				}

				return { id: name, label: label, children };
			} else {
				const found = menus.find(m => m.id === menuItem.module);
				if (
					!found &&
					!menuItem.isDynamic &&
					(isDevelopmentMode() || !menuItem.onlyInDevelopmentMode)
				) {
					throw new Error(
						`Did not find menu entry for ${menuItem.module}. Remove it from the 'mainMenu' object below.`
					);
				}
				return found;
			}
		})
		.filter((menu): menu is DynamicMenu => menu !== undefined);
}

const mainMenu: readonly MenuTree[] = [
	{
		name: "data-handling",
		label: [
			{ locale: "en", text: "Data Handling" },
			{ locale: "de", text: "Datenverarbeitung" }
		],
		children: [
			{ module: "data_handling.data-editor" },
			{ module: "data_handling.dirty-handling" },
			{ module: "data_handling.without-model" },
			{ module: "data_handling.heterogeneity" },
			{ module: "data_handling.no-model-instance" },
			{ module: "data_handling.multiple-dataholders" },
			{ module: "data_handling.saga-state-changes" }
		]
	},
	{
		name: "ui-handling",
		label: [
			{ locale: "en", text: "UI Handling" },
			{ locale: "de", text: "UI Behandlung" }
		],
		children: [
			{ module: "ui_handling.views-concept" },
			{
				name: "layouts",
				label: [
					{ locale: "en", text: "Layouts" },
					{ locale: "de", text: "Layouts" }
				],
				children: [
					{ module: "ui_handling.application-frame-layout" },
					{ module: "ui_handling.master-detail" },
					{ module: "ui_handling.dashboard-layout" }
				]
			},
			{
				name: "Regions",
				label: [
					{ locale: "en", text: "Regions" },
					{ locale: "de", text: "Regionen" }
				],
				children: [
					{ module: "ui_handling.modal-region" },
					{ module: "ui_handling.custom-region.dynamicMenu" }
				]
			},
			{
				module: "ui_handling.permissions.dynamicMenu"
			},
			{ module: "ui_handling.notifications" },
			{
				name: "case",
				label: [
					{ locale: "en", text: "Case" },
					{ locale: "de", text: "Case" }
				],
				children: [
					{ module: "ui_handling.case.concept" },
					{ module: "ui_handling.case.model-loading" }
				]
			},
			{ module: "ui_handling.entity-linking" },
			{ module: "ui_handling.mobile-navigation" },
			// TODO: merge this with the layout above when it was migrated to DynamicConfig
			{ module: "ui_handling.mobile-custom-layout" }
		]
	},
	{
		name: "error-handling",
		label: [
			{ locale: "en", text: "Error Handling" },
			{ locale: "de", text: "Error Handling" }
		],
		children: [
			{ module: "error_handling.general" },
			{ module: "error_handling.commit-error" },
			{ module: "error_handling.error-boundaries" }
		]
	},
	{
		name: "examples",
		label: [
			{ locale: "en", text: "Examples" },
			{ locale: "de", text: "Beispiele" }
		],
		children: [
			{
				module: "examples.DC.dynamicMenu"
			},
			{
				name: "models",
				label: [
					{ locale: "en", text: "Models" },
					{ locale: "de", text: "Modelle" }
				],
				children: [
					{ module: "examples.multiple-models" },
					{ module: "examples.model-driven-dialog" },
					{ module: "examples.maximize-form" }
				]
			},
			{
				name: "data-examples",
				label: [
					{ locale: "en", text: "Data Handling Examples" },
					{ locale: "de", text: "Beispiele für Datenverarbeitung" }
				],
				children: [{ module: "examples.activity-replacement" }, { module: "examples.initial-data" }]
			},
			{
				name: "sagas",
				label: [
					{ locale: "en", text: "Sagas" },
					{ locale: "de", text: "Sagas" }
				],
				children: [{ module: "examples.saga-override" }, { module: "examples.background-saga" }]
			},
			{
				name: "Focus Handling",
				label: [
					{ locale: "en", text: "Focus Handling Examples" },
					{ locale: "de", text: "Beispiele Focus Handling" }
				],
				children: [
					{ module: "examples.focus_handling" },
					{ module: "examples.focus_handling_progress_indicator" }
				]
			},
			{ module: "examples.dynamic-models" }
		]
	},
	{
		name: "about",
		label: [
			{ locale: "en", text: "About" },
			{ locale: "de", text: "Über" }
		],
		children: [{ module: "about.contact.dynamicMenu" }, { module: "about.versionInfo" }]
	},
	{
		name: "dev-mode",
		label: [
			{ locale: "en", text: "Development" },
			{ locale: "de", text: "Development" }
		],
		children: [
			{ module: "dev-mode.dynamic-module", onlyInDevelopmentMode: true },
			{ module: "dev-mode.activities-reducer", onlyInDevelopmentMode: true }
		]
	},
	{ module: "example_dynamic_module", isDynamic: true }
];
