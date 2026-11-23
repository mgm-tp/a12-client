// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ComponentType, Context } from "react";

import type { MainMenuProps as InternalMainMenuProps } from "./components/MainMenu.js";
import type {
	ApplicationFrameLayoutProps as InternalFrameLayoutProps,
	HeaderItemProps as InternalHeaderItemProps,
	NavigationBarTitleProps as InternalNavigationBarTitleProps,
	SidebarContextProps as SidebarContextPropsInternal
} from "./layout/ApplicationFrameLayout.js";
import ApplicationFrameLayoutInternal, {
	SidebarContext as SidebarContextInternal
} from "./layout/ApplicationFrameLayout.js";
import type * as InternalLayoutProps from "./layout/LayoutProps.js";
import type { MainMenuContextProps as MainMenuContextPropsInternal } from "./layout/MainMenuContext.js";
import { MainMenuContext as MainMenuContextInternal } from "./layout/MainMenuContext.js";
import type { MasterDetailLayoutProps as InternalMasterDetailLayoutProps } from "./layout/MasterDetailRegionLayout.js";
import MasterDetailRegionLayoutComponent from "./layout/MasterDetailRegionLayout.js";

export namespace FrameViews {
	/** Providers that can be used by all frame components */
	export type ProviderProps = InternalLayoutProps.ProvidersProps;

	/** Specific props for Region UI components. */
	export type RegionUiProps = InternalLayoutProps.RegionUiProps;

	/**
	 * Return the component that should be used to render regions of the given name.
	 * @param region: Name of the region for which the component should be provided
	 */
	export type RegionUiProvider = InternalLayoutProps.RegionUiProvider;

	/** Layout component */
	export type Layout = InternalLayoutProps.Layout;

	/** Specific props for layout components */
	export type LayoutProps = InternalLayoutProps.LayoutProps;

	/**
	 * Return the component that should be used to render views.
	 * @param layout: Name of the layout for which the component should be provided
	 */
	export type LayoutProvider = InternalLayoutProps.LayoutProvider;

	export type ApplicationFrameLayoutProps = InternalFrameLayoutProps;

	/**
	 * React component to render the application frame according to the application model
	 * To show the application frame the current user must be authenticated.
	 */
	export const ApplicationFrameLayout: ComponentType<ApplicationFrameLayoutProps> =
		ApplicationFrameLayoutInternal.component;

	/**
	 * Context for components inside the SIDEBAR region of ApplicationFrameLayout.
	 */
	export const SidebarContext: Context<SidebarContextProps | undefined> = SidebarContextInternal;
	export type SidebarContextProps = SidebarContextPropsInternal;

	export const MainMenuContext: Context<MainMenuContextProps | undefined> = MainMenuContextInternal;
	export type MainMenuContextProps = MainMenuContextPropsInternal;

	export type HeaderItemProps = InternalHeaderItemProps;

	export type NavigationBarTitleProps = InternalNavigationBarTitleProps;

	export type MainMenuProps = InternalMainMenuProps;

	export type MasterDetailLayoutProps = InternalMasterDetailLayoutProps;

	/**
	 * React component to render views of a region in a master detail layout.
	 */
	export const MasterDetailRegionLayout: ComponentType<MasterDetailLayoutProps> =
		MasterDetailRegionLayoutComponent.component;
}
