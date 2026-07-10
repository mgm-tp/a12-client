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

import type { ComponentType, JSX, ReactElement, ReactNode } from "react";
import { useCallback, useContext, useMemo, useState } from "react";

import {
	type Container,
	NavigationContentboxContext,
	SizeContext
} from "@com.mgmtp.a12.widgets/widgets-core";

import { ClientWidgetMapContext } from "../../../../ClientWidgetMap.js";
import type { ApplicationModel } from "../../../../model/index.js";
import type { View } from "../../../../view/index.js";
import { isOnSmallDevice } from "../../../../view/internal/size-context.js";
import type { MainMenuProps } from "../../components/MainMenu.js";

import type { Layout, LayoutProps } from "../LayoutProps.js";
import type { MainMenuContextProps } from "../MainMenuContext.js";
import { MainMenuContext } from "../MainMenuContext.js";
import { type RegionInformation } from "../mobile-navigation.js";

import { PageTemplate } from "./pageTemplate.js";
import { SidebarContextMemoWrapper, type SidebarContextProps } from "./sidebarContext.js";
import { useApplicationFrameState } from "./useApplicationFrameState.js";
import { useMobileNavigation } from "./useMobileNavigation.js";
import { useSidebarExpansion } from "./useSidebarExpansion.js";

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

/**
 * This layout uses the ApplicationFrame widget to create an application frame.
 *
 * It supports three, distinct sub-regions:
 * * *CONTENT (required):* placed in the _content_ area of ApplicationFrame
 * * *SIDEBAR (optional):* placed in the _sub_ area of ApplicationFrame
 * * *MODAL (optional):* rendered using the ModalOverlay
 *
 * It contains some additional elements:
 * * *view menu:* Render a menu for _Views_ using the FlyoutMenu and SlidingMenu widget
 *
 * Both header and view menu use DeviceDetector to adapt to smartphone/tablet and desktop devices.
 *
 * @internal
 */
export function ApplicationFrameLayoutComponent(props: ApplicationFrameLayoutProps): ReactNode {
	const {
		regionReference,
		views,
		layoutProvider,
		regionUiProvider,
		viewProvider,
		progressComponentProvider,
		errorBoundaryProvider,
		logo,
		logoURL,
		title,
		footer,
		globalMessageBox,
		additionalHeaderItems,
		mainMenuComponent,
		navigationBarTitle: NavigationBarTitle,
		settings,
		permissions,
		disableMobileNavigation
	} = props;

	const {
		activityIdMap,
		sidebar,
		sidebarRegion,
		cancelActivities,
		content,
		contentRegion,
		viewDirectives,
		modalRegion
	} = useApplicationFrameState(regionReference, regionUiProvider, views);

	const { ContentBoxBackButton, ContentBoxHeading, ContentBoxTitle } =
		useContext(ClientWidgetMapContext);
	const currentSize = useContext(SizeContext)?.currentSize;

	const { subExpanded, setSubExpanded, subExpandedState, setSubExpandedState } =
		useSidebarExpansion(
			settings?.initialSubExpanded ?? true,
			settings?.initialSubExpandedState,
			activityIdMap,
			sidebar,
			content,
			currentSize
		);

	const [mainMenuExpanded, setMainMenuExpanded] = useState(false);

	// only set if sidebar is visible
	const sidebarContext: SidebarContextProps | undefined = useMemo(
		() =>
			sidebarRegion
				? { subExpanded, setSubExpanded, subExpandedState, setSubExpandedState }
				: undefined,
		[sidebarRegion, subExpanded, subExpandedState, setSubExpanded, setSubExpandedState]
	);

	const mainMenuContext: MainMenuContextProps = useMemo(
		() => ({ mainMenuExpanded, setMainMenuExpanded }),
		[mainMenuExpanded]
	);

	const createRegionInfo = useCallback(
		(regionName: "SIDEBAR" | "CONTENT"): RegionInformation => {
			const region = regionName === "SIDEBAR" ? sidebar : content;
			const lp = layoutProvider(region.layout.name);
			const clearedAfter = lp.getClearedAfterViewIndex?.({
				layoutProvider,
				progressComponentProvider,
				regionReference,
				regionUiProvider,
				viewProvider,
				errorBoundaryProvider,
				settings,
				views: region.views
			});
			return {
				regionReference: [regionName],
				clearedAfter: clearedAfter?.(currentSize),
				views: region.views
			};
		},
		[
			sidebar,
			content,
			currentSize,
			layoutProvider,
			progressComponentProvider,
			regionReference,
			regionUiProvider,
			viewProvider,
			errorBoundaryProvider,
			settings
		]
	);

	const { mobileMode, hideHeaderFooter, onSidebarBackButtonClicked, onContentBackButtonClicked } =
		useMobileNavigation({
			subExpanded,
			setSubExpanded,
			hasSidebar: sidebarRegion !== undefined,
			disableMobileNavigation,
			cancelActivities,
			viewDirectives,
			activityIdMap,
			createRegionInfo,
			currentSize
		});

	const contentLayout = layoutProvider(content.layout.name);
	const multipleViewsContent = contentLayout.visibleViews === "multiple";

	const navigationBarTitle = NavigationBarTitle ? (
		<NavigationBarTitle visibleViews={sidebar.views} />
	) : undefined;

	const contentNavigationBar =
		onContentBackButtonClicked && multipleViewsContent ? (
			<ContentBoxHeading>
				<ContentBoxBackButton onClick={onContentBackButtonClicked} />
				<ContentBoxTitle text={navigationBarTitle} />
			</ContentBoxHeading>
		) : null;

	const sidebarNavigationBar = onSidebarBackButtonClicked ? (
		<ContentBoxHeading>
			<ContentBoxBackButton onClick={onSidebarBackButtonClicked} />
			<ContentBoxTitle text={navigationBarTitle} />
		</ContentBoxHeading>
	) : null;

	return (
		<SidebarContextMemoWrapper contextValue={sidebarContext}>
			<MainMenuContext.Provider value={mainMenuContext}>
				<PageTemplate
					contentNavigationBar={contentNavigationBar}
					sidebarNavigationBar={sidebarNavigationBar}
					globalMessageBox={globalMessageBox}
					title={title}
					logoImage={logo ?? <FallbackLogo logoURL={logoURL} />}
					additionalHeaderItems={additionalHeaderItems}
					content={
						<ContentWrapper
							multipleViewsContent={multipleViewsContent}
							onContentBackButtonClicked={onContentBackButtonClicked}
						>
							<contentRegion.component
								regionReference={contentRegion.ref}
								layoutProvider={layoutProvider}
								regionUiProvider={regionUiProvider}
								viewProvider={viewProvider}
								progressComponentProvider={progressComponentProvider}
								errorBoundaryProvider={errorBoundaryProvider}
							/>
						</ContentWrapper>
					}
					sidebar={
						sidebarRegion && (
							<sidebarRegion.component
								regionReference={sidebarRegion.ref}
								layoutProvider={layoutProvider}
								regionUiProvider={regionUiProvider}
								viewProvider={viewProvider}
								progressComponentProvider={progressComponentProvider}
								errorBoundaryProvider={errorBoundaryProvider}
							/>
						)
					}
					subExpanded={subExpanded}
					onSubExpanded={setSubExpanded}
					subExpandedState={subExpandedState}
					disableCollapsingSub={settings?.disableCollapsingSub ?? false}
					mobileMode={mobileMode}
					mainMenuExpanded={mainMenuExpanded}
					onMainMenuExpansionChange={() => setMainMenuExpanded(prev => !prev)}
					mainMenuComponent={mainMenuComponent}
					permissions={permissions}
					footer={hideHeaderFooter ? undefined : footer}
					hideHeader={hideHeaderFooter}
					disableMobileNavigation={disableMobileNavigation}
					htmlAttributes={
						mainMenuExpanded && isOnSmallDevice(currentSize)
							? {
									contentAttributes: { "aria-hidden": true },
									footerAttributes: { "aria-hidden": true }
								}
							: undefined
					}
					regionReference={regionReference}
				/>
				{modalRegion && (
					<modalRegion.component
						regionReference={modalRegion.ref}
						layoutProvider={layoutProvider}
						regionUiProvider={regionUiProvider}
						viewProvider={viewProvider}
						progressComponentProvider={progressComponentProvider}
						errorBoundaryProvider={errorBoundaryProvider}
					/>
				)}
			</MainMenuContext.Provider>
		</SidebarContextMemoWrapper>
	);
}
ApplicationFrameLayoutComponent.whyDidYouRender = true;

/** @internal */
const layout: Layout = {
	component: ApplicationFrameLayoutComponent
};

/** @internal */
export default layout;

interface ContentWrapperProps extends Container {
	readonly onContentBackButtonClicked?: () => void;
	readonly multipleViewsContent: boolean;
}

/** @internal */
export const ContentWrapper: ComponentType<ContentWrapperProps> = function ContentWrapper({
	onContentBackButtonClicked,
	multipleViewsContent,
	children
}) {
	const value = useMemo(
		() => ({
			onBackButtonClicked: !multipleViewsContent ? onContentBackButtonClicked : undefined
		}),
		[multipleViewsContent, onContentBackButtonClicked]
	);

	return (
		<NavigationContentboxContext.Provider value={value}>
			{children}
		</NavigationContentboxContext.Provider>
	);
};

/** @internal */
export function FallbackLogo(props: { logoURL?: string }): JSX.Element | null {
	return props.logoURL ? (
		<a href="#" style={{ height: "32px", display: "flex" }}>
			<img src={props.logoURL} style={{ height: "32px" }} />
		</a>
	) : null;
}
