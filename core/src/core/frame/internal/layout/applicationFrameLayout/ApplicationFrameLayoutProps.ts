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

import type { ComponentType, ReactElement, ReactNode } from "react";

import type { ApplicationModel } from "../../../../model/internal/ApplicationModel.js";
import type { View } from "../../../../view/internal/view.js";
import type { MainMenuProps } from "../../components/MainMenu.js";

import type { LayoutProps } from "../LayoutProps.js";

export interface Region {
	readonly views: View[];
	readonly layout: ApplicationModel.Layout;
}

/** props to render an ApplicationFrameLayout React component */
export interface ApplicationFrameLayoutProps extends LayoutProps {
	readonly globalMessageBox?: ReactNode;

	/** the URL to the image shown as logo in the application frame */
	readonly logoURL?: string;

	/** A custom component to be used for the logo */
	readonly logo?: ReactNode;

	/** A custom component to be used for the title */
	readonly title?: ReactNode;

	/**
	 * This component is used for the main menu in the application header
	 * instead of the default main menu, if it is provided.
	 */
	readonly mainMenuComponent?: ComponentType<MainMenuProps>;

	/**
	 * Additional items which should be shown in the application header
	 */
	readonly additionalHeaderItems?: ReadonlyArray<HeaderItemProps>;

	/** Optional footer element for the application */
	readonly footer?: ReactElement;

	/**
	 * Optional component that renders a title inside the navigation bar (mobile
	 * only). The title receives the list of visible views, so that it can
	 * decide what to use as title. Normally, the component should only render
	 * a string.
	 */
	readonly navigationBarTitle?: ComponentType<NavigationBarTitleProps>;

	/**
	 * Flag to disable mobile navigation.
	 * If mobile navigation is disabled:
	 *  * no back-button will be rendered in the `subToolbar` or `contentToolbar`
	 *    of the app frame
	 *  * the header will not be hidden at any time
	 *  * the toggle button for the sidebar will be shown
	 */
	readonly disableMobileNavigation?: boolean;

	/**
	 * A list of permission that are used to show user menu entries based on
	 * the permissions from the application model.
	 */
	readonly permissions?: string[];

	readonly settings?: ApplicationModel.ApplicationFrame.Settings;
}

export interface NavigationBarTitleProps {
	readonly visibleViews: View[];
}

/**
 * Props for an header item which is added to the application frame header
 */
export interface HeaderItemProps {
	/** React component which should be shown */
	readonly item: ReactNode;

	/**
	 * Orientation of the item which can be at the moment "leftSlots-right"
	 * or "rightSlots-left".
	 *
	 * "leftSlots-right":
	 * Item will be added on the left side after the logo image and the title.
	 *
	 * "rightSlots-left":
	 * Item will be added on the right side before the version information and the user info.
	 *
	 * An extension of this type is not considered a breaking change.
	 */
	readonly orientation: "leftSlots-right" | "rightSlots-left";
}
