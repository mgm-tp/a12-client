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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import deepEqual from "fast-deep-equal";
import type { JSX, RefObject } from "react";
import { useContext, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import type { Locale } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/Locale.js";
import { localizableFromModel } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/LocalizableFactory.js";
import type { Localizer } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/Localizer.js";
import type { MenuItem } from "@com.mgmtp.a12.widgets/widgets-core/lib/menu/main/menu.api.js";

import { Activity, ActivityMap, ActivitySelectors } from "../../../activity/index.js";
import { ApplicationActions } from "../../../application/internal/actions.js";
import { ClientWidgetMapContext } from "../../../ClientWidgetMap.js";
import { LocaleSelectors } from "../../../locale/index.js";
import { ApplicationModel, ModelSelectors } from "../../../model/index.js";

interface Item {
	readonly id: string;
	readonly label: string;
	readonly initialActivity?: ApplicationModel.InitialActivity;
	readonly active?: boolean;
	readonly children?: Item[];
}

export interface MainMenuProps {
	/** Wether the mobile mode is active or not */
	readonly mobileMode: boolean;
	/** Wether the main menu is expanded or not  */
	readonly expanded: boolean;
	/** The ref to the element which opens and closes the menu */
	readonly triggerElement?: RefObject<HTMLElement | null>;
	/** Permissions of the current user defined by the ApplicationFrameLayout */
	readonly permissions?: string[];
	/**
	 * An id for the menu.
	 *
	 * In the built-in MainMenu component this is handed to the underlying menu
	 * widget and there also used as prefix in the ids of menu items.
	 * If not provided, the menu widget will render without id and menu items
	 * use a randomly generated, unstable prefix in their id.
	 */
	readonly id?: string;
	onMenuItemClick(): void;
}

/**
 * Main menu component.
 *
 * On selection of a menu item, starts a new activity using the menu state as descriptor.
 *
 * Also cancels any other running top level activity.
 *
 * Furthermore the component implements a tab circle between the button, which opens
 * the menu, the menu and the elements in the header.
 */
export default function MainMenu(props: MainMenuProps): JSX.Element {
	const dispatch = useDispatch();

	function toWidgetItem({ id, label, active, initialActivity, children }: Item): MenuItem {
		return {
			id,
			label,
			selected: active,
			onClick:
				initialActivity && Object.keys(initialActivity.descriptor).length > 0
					? () => {
							props.onMenuItemClick();
							dispatch(ApplicationActions.startMainActivityRequested(initialActivity));
						}
					: undefined,
			items: children ? children.map(toWidgetItem) : undefined
		};
	}

	const items = useItemsFromAppModel(props.permissions).map(toWidgetItem);
	return <MainMenuTemplate items={items} {...props} />;
}

MainMenu.whyDidYouRender = true;

interface MainMenuTemplateProps extends MainMenuProps {
	readonly items: MenuItem[];
}

function MainMenuTemplate(props: MainMenuTemplateProps): JSX.Element {
	const { SlidingMenu, FlyoutMenu, SlidingMenuWrapper } = useContext(ClientWidgetMapContext);
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

	return props.mobileMode ? (
		<SlidingMenuWrapper expanded={props.expanded}>
			<SlidingMenu
				id={props.id}
				items={props.items}
				useAs="main"
				onTabOut={e => {
					/**
					 * Focus the trigger element (e.g. the button which opened
					 * the menu) when the user tabs out of the menu
					 * This is necessary for A11Y reasons and to create the tab circle.
					 */
					e.preventDefault();
					if (props.triggerElement && props.triggerElement !== null) {
						props.triggerElement.current?.focus();
					}
				}}
				wrapperRef={ref => {
					slidingMenuWrapper.current = ref;
				}}
			/>
		</SlidingMenuWrapper>
	) : (
		<FlyoutMenu id={props.id} type="horizontal" items={props.items} useAs="main" />
	);
}

function hasPermissionOrEmpty(menu: ApplicationModel.Menu, permissions?: string[]): boolean {
	if (!menu.permission) {
		return true;
	}
	const roles = menu.permission.split(",");
	return (permissions ?? []).some(p => roles.includes(p));
}

function filterByPermission(
	menus: ApplicationModel.Menu[],
	permissions?: string[]
): ApplicationModel.Menu[] {
	const childMenus = menus.flatMap(menu => {
		if (!hasPermissionOrEmpty(menu, permissions)) {
			return [];
		}

		if (!menu.children) {
			return menu;
		}

		const children = filterByPermission(menu.children, permissions);
		if (children.length === 0 && !menu.initialActivity) {
			return [];
		}

		return {
			...menu,
			children
		};
	});

	return childMenus;
}

/**
 * Maps the external item structure to the internal.
 */
const useItemsFromAppModel = (permissions?: string[]): Item[] => {
	const localizer = useContext(LocalizerContext).localizer;
	const appModel = useSelector(ModelSelectors.applicationModel());
	const topLevelActivitiesDescriptors = useSelector(
		state => {
			const topLevelActivities = ActivitySelectors.topLevelActivities()(state);
			return ActivityMap.toOrderedList(topLevelActivities).map(a => a.descriptor);
		},
		(left, right) =>
			left.length === right.length &&
			left.every((prevAct, index) => Activity.Descriptor.equal(prevAct, right[index]))
	);
	const locale = useSelector(LocaleSelectors.locale());
	return (
		appModel.content.modules
			// Remove entries the user has no permissions for
			.flatMap(module => {
				if (!module.menu || !hasPermissionOrEmpty(module.menu, permissions)) {
					return [];
				}

				if (!module.menu.children) {
					return module;
				}

				const filteredChildren = filterByPermission(module.menu.children, permissions);
				if (filteredChildren.length === 0 && !module.menu.initialActivity) {
					return [];
				}

				return {
					...module,
					menu: {
						...module.menu,
						children: filteredChildren
					}
				};
			})
			// Map to widget structure
			.map(module =>
				mapMenuItem(
					localizer,
					topLevelActivitiesDescriptors,
					locale,
					appModel,
					module,
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					module.menu!
				)
			)
	);
};

function mapMenuItem(
	localizer: Localizer,
	topLevelActivitiesDescriptors: Activity.Descriptor[],
	locale: Locale,
	model: ApplicationModel,
	module: ApplicationModel.Module,
	menu: ApplicationModel.Menu,
	parentMenus: ApplicationModel.Menu[] = []
): Item {
	const menuPath = [...parentMenus, menu];

	const children = menu.children
		? menu.children.map(child =>
				mapMenuItem(
					localizer,
					topLevelActivitiesDescriptors,
					locale,
					model,
					module,
					child,
					menuPath
				)
			)
		: undefined;

	const active =
		topLevelActivitiesDescriptors.some(activity =>
			deepEqual(activity, menu.initialActivity?.descriptor)
		) ||
		(children !== undefined && children.some(child => child.active === true));

	const localizableKey = ApplicationModel.Menu.getKey(model, module, menuPath);
	const label = localizer(localizableFromModel(localizableKey, menu.label)) ?? "";

	return { id: menu.name, label, initialActivity: menu.initialActivity, active, children };
}
