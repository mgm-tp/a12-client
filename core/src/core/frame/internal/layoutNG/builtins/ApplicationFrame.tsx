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

import deepEqual from "fast-deep-equal";
import type { ComponentType, HTMLAttributes, JSX, ReactNode } from "react";
import { memo, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { localizableFromLocalizationTreeMap } from "@com.mgmtp.a12.utils/utils-localization";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react";
import {
	addPrefix,
	SizeContext,
	type SizeDetectorProps
} from "@com.mgmtp.a12.widgets/widgets-core";

import { ActivitySelectors } from "../../../../activity/index.js";
import { ActivityActions } from "../../../../activity/internal/actions.js";
import { assertCondition } from "../../../../assertion.js";
import { ClientWidgetMapContext } from "../../../../ClientWidgetMap.js";
import {
	dynamicAllViews,
	DynamicModelSelectors
} from "../../../../configurationNG/internal/dynamicSelectors.js";
import { LOCALE_RESOURCE_KEYS } from "../../../../locale/index.js";
import { ApplicationModel } from "../../../../model/index.js";
import { noop } from "../../../../utils.js";
import type { View, ViewNG } from "../../../../view/index.js";
import { isOnSmallDevice } from "../../../../view/internal/size-context.js";
import { DynamicMainMenu } from "../../components/DynamicMainMenu.js";
import type { MainMenuProps } from "../../components/MainMenu.js";
import {
	DEFAULT_TRANSLATIONS,
	RESOURCE_KEYS as FRAME_RESOURCE_KEYS
} from "../../languages/index.js";
import type { HeaderItemProps } from "../../layout/applicationFrameLayout/applicationFrameLayout.js";
import {
	ContentWrapper,
	FallbackLogo
} from "../../layout/applicationFrameLayout/applicationFrameLayout.js";
import {
	SidebarContextMemoWrapper,
	type SidebarContextProps
} from "../../layout/applicationFrameLayout/sidebarContext.js";
import type { MainMenuContextProps } from "../../layout/MainMenuContext.js";
import { MainMenuContext } from "../../layout/MainMenuContext.js";
import {
	MobileNavigationAction,
	type RegionInformation,
	type ViewWithRegionReference
} from "../../layout/mobile-navigation.js";

import { DynamicRegionUi } from "../DynamicRegionUi.js";
import {
	ROOT_REGION_REF,
	type LayoutNG,
	type LayoutPropsNG,
	type RegionReferenceNG
} from "../layoutPropsNG.js";
import { ModalRegionUiNG } from "../ModalRegionUiNG.js";

const htmlAttributes = {
	contentAttributes: { "aria-hidden": true },
	footerAttributes: { "aria-hidden": true }
};

function ApplicationFrameLayoutNGComponentInternal(props: ApplicationFrameLayoutPropsNG) {
	const { localizer } = useContext(LocalizerContext);
	const dispatch = useDispatch();
	const { ContentBoxBackButton, ContentBoxHeading, ContentBoxTitle } =
		useContext(ClientWidgetMapContext);

	const { currentSize } = useContext(SizeContext);

	const [mainMenuExpanded, setMainMenuExpanded] = useState(false);
	const [subExpanded, setSubExpanded] = useState(props.subExpanded ?? true);
	const [subExpandedState, setSubExpandedState] = useState(props.subExpandedState);

	if (props.subRegionRefs?.length === 0) {
		if (props.views.length > 0) {
			throw new Error("ApplicationFrameLayout does not support views");
		} else {
			throw new Error("ApplicationFrameLayout: Missing sub-regions");
		}
	}

	const contentRegionRef = props.subRegionRefs?.find(ref => ref.endsWith("/CONTENT"));
	if (contentRegionRef === undefined) {
		throw new Error("ApplicationFrameLayout: No content region found");
	}

	const sidebarRegionRef = props.subRegionRefs?.find(ref => ref.endsWith("/SIDEBAR"));

	const hasViews = useSelector(state =>
		sidebarRegionRef
			? DynamicModelSelectors.dynamicRegionInfo(sidebarRegionRef)(state).views.length > 0
			: false
	);

	// sidebar without any views should be considered as "no sidebar"
	const usedSidebarRegionRef = hasViews ? sidebarRegionRef : undefined;

	const modalRegionRef = props.subRegionRefs?.find(ref => ref.endsWith("/MODAL"));
	const modalHasViews = useSelector(state =>
		modalRegionRef
			? DynamicModelSelectors.dynamicRegionInfo(modalRegionRef)(state).views.length > 0
			: false
	);

	const {
		additionalHeaderItems,
		globalMessageBox,
		logo,
		logoURL,
		mainMenuComponent,
		title,
		footer,
		navigationBarTitle
	} = props;
	const mobileMode = isOnSmallDevice(currentSize);
	const mobileNavigationEnabled = mobileMode && props.disableMobileNavigation !== true;

	// used to determine button actions in mobile mode
	const currentVisibleRegion =
		!subExpanded || usedSidebarRegionRef === undefined ? "CONTENT" : "SIDEBAR";

	const mobileBackButtonAction = useEvaluateMobileNavigationBackButtonAction();
	const hideHeaderFooter = mobileBackButtonAction !== undefined;

	const multipleViewsContent = props.multipleViewsContent ?? false;

	const onSidebarBackButtonClicked =
		currentVisibleRegion === "SIDEBAR" && mobileBackButtonAction?.type === "CancelActivity"
			? () => {
					dispatch(
						ActivityActions.cancelRequested({
							activityIds: mobileBackButtonAction.activitiesToCancel
						})
					);
				}
			: undefined;

	const onContentBackButtonClicked =
		currentVisibleRegion === "CONTENT" && mobileBackButtonAction
			? mobileBackButtonAction.type === "RegionSwitch"
				? ApplicationModel.Region.Reference.equal(mobileBackButtonAction.switchToRegion, [
						"SIDEBAR"
					])
					? () => setSubExpanded(true)
					: undefined
				: () =>
						dispatch(
							ActivityActions.cancelRequested({
								activityIds: mobileBackButtonAction.activitiesToCancel
							})
						)
			: undefined;

	const contentElement = (
		<ContentWrapper
			multipleViewsContent={multipleViewsContent}
			onContentBackButtonClicked={onContentBackButtonClicked}
			key="content"
		>
			<DynamicRegionUi regionRef={contentRegionRef} />
		</ContentWrapper>
	);

	const sidebarElement = usedSidebarRegionRef ? (
		<DynamicRegionUi regionRef={usedSidebarRegionRef} />
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

	// only set if sidebar is visible
	const sidebarContext: SidebarContextProps | undefined = usedSidebarRegionRef
		? {
				subExpanded: subExpanded,
				setSubExpanded: setSubExpanded,
				subExpandedState: subExpandedState,
				setSubExpandedState: setSubExpandedState
			}
		: undefined;

	const mainMenuContext: MainMenuContextProps = useMemo(
		() => ({
			mainMenuExpanded: mainMenuExpanded,
			setMainMenuExpanded: setMainMenuExpanded
		}),
		[mainMenuExpanded]
	);

	return (
		<SidebarContextMemoWrapper contextValue={sidebarContext}>
			<MainMenuContext.Provider value={mainMenuContext}>
				<PageTemplate
					contentNavigationBar={contentNavigationBar}
					sidebarNavigationBar={sidebarNavigationBar}
					globalMessageBox={globalMessageBox}
					title={title ?? localizer({ key: LOCALE_RESOURCE_KEYS.application.title })}
					logoImage={logo ?? <FallbackLogo logoURL={logoURL} />}
					content={contentElement}
					sidebar={sidebarElement}
					mobileMode={mobileMode}
					subExpanded={subExpanded}
					onSubExpanded={setSubExpanded}
					mainMenuComponent={mainMenuComponent}
					additionalHeaderItems={additionalHeaderItems}
					footer={hideHeaderFooter ? undefined : footer}
					hideHeader={hideHeaderFooter}
					disableMobileNavigation={props.disableMobileNavigation}
					subExpandedState={subExpandedState}
					disableCollapsingSub={props.disableCollapsingSub}
					htmlAttributes={
						mainMenuExpanded && isOnSmallDevice(currentSize) ? htmlAttributes : undefined
					}
					regionReference={props.regionRef}
				/>

				{modalRegionRef && modalHasViews && <ModalRegionUiNG regionRef={modalRegionRef} />}
			</MainMenuContext.Provider>
		</SidebarContextMemoWrapper>
	);

	function useEvaluateMobileNavigationBackButtonAction(): MobileNavigationAction | undefined {
		const sidebarRegionInfo = useSelector(
			DynamicModelSelectors.dynamicRegionInfo(sidebarRegionRef ?? "")
		);
		const contentRegionInfo = useSelector(
			DynamicModelSelectors.dynamicRegionInfo(contentRegionRef ?? "")
		);

		const viewDirectives = useSelector(
			state =>
				dynamicAllViews()(state).flatMap(vd =>
					vd.regionReference !== "/MODAL"
						? ({
								activityId: vd.props.activityId,
								regionReference: asAppModelRegionRef(vd.regionReference)
							} as ViewWithRegionReference)
						: []
				),
			deepEqual
		);

		const activityIdMap = useSelector(state => {
			const activities = ActivitySelectors.activities()(state);

			return Object.fromEntries(
				Object.entries(activities).map(([id, activity]) =>
					activity ? [id, activity?.initiatingActivityId] : []
				) as [string, string | undefined][]
			);
		}, deepEqual);

		return mobileNavigationEnabled
			? MobileNavigationAction.calculate({
					listOfViews: viewDirectives,
					activityIdMap,
					regionInformation: [
						createRegionInformation(sidebarRegionRef ?? "", sidebarRegionInfo),
						createRegionInformation(contentRegionRef ?? "", contentRegionInfo)
					],
					visibleRegion: [currentVisibleRegion]
				})
			: undefined;
	}

	function createRegionInformation(
		regionReference: RegionReferenceNG,
		regionInfo: { layout: LayoutNG; views: ViewNG[] }
	): RegionInformation {
		return {
			regionReference: asAppModelRegionRef(regionReference),
			clearedAfter: props.getClearedAfterViewIndex?.(
				regionInfo.layout,
				regionInfo.views
			)?.(currentSize ?? "lg"),
			views: regionInfo.views.map(v => v.props as View)
		};
	}

	/**
	 * Necessary since old (appmodel) refs do not include the root region name
	 * e.g. content is always the array ["CONTENT"]
	 *
	 * with dynamic config, the ref is a string
	 * e.g content is always the string "/CONTENT" (the root region is unnamed and therefore not part of the ref)
	 *
	 * To be able to reuse the mobile navigation code, we turn the new refs into
	 * old ones here.
	 *
	 * When we fully support dynamic config over appmodels, this should be simplified.
	 */
	function asAppModelRegionRef(
		regionReference: RegionReferenceNG
	): ApplicationModel.Region.Reference {
		const ref = regionReference.split("/").at(-1);
		assertCondition(typeof ref === "string");

		return [ref];
	}
}

ApplicationFrameLayoutNGComponentInternal.whyDidYouRender = true;

export interface PageProps {
	globalMessageBox?: ReactNode;
	title: ReactNode;
	logoImage?: ReactNode;
	content: ReactNode;
	sidebar: ReactNode;
	mobileMode: boolean;
	subExpanded: boolean;
	subExpandedState?: "minimized" | "maximized";
	onSubExpanded(expanded: boolean): void;
	hideHeader?: boolean;
	contentNavigationBar?: ReactNode;
	sidebarNavigationBar?: ReactNode;
	disableMobileNavigation?: boolean;
	htmlAttributes?: {
		headerAttributes?: HTMLAttributes<HTMLDivElement>;
		contentAttributes?: HTMLAttributes<HTMLDivElement>;
		footerAttributes?: HTMLAttributes<HTMLDivElement>;
	};

	/**
	 * This component is used for the main menu in the application header
	 * instead of the default main menu, if it is provided.
	 */
	readonly mainMenuComponent?: ComponentType<MainMenuProps>;

	readonly additionalHeaderItems?: ReadonlyArray<HeaderItemProps>;

	/** Optional footer element for the application */
	readonly footer?: ReactNode;

	readonly disableCollapsingSub?: boolean;

	readonly regionReference: string;
}

function PageTemplate(props: PageProps): JSX.Element {
	const { localizer } = useContext(LocalizerContext);

	const { Icon, Button, ApplicationHeader, ApplicationFrame } = useContext(ClientWidgetMapContext);

	const m = useContext(MainMenuContext);

	const onMainMenuExpansionChange = useCallback(() => {
		m?.setMainMenuExpanded(!m.mainMenuExpanded);
	}, [m]);

	const rightViews = [];
	const leftViews = [];

	const { onSubExpanded, subExpanded } = props;

	const hamburgerButtonRef = useRef<HTMLElement | null>(null);
	if (props.mobileMode) {
		const hamburgerIcon = <Icon>menu</Icon>;

		const hamburgerButton = (
			<Button
				icon={hamburgerIcon}
				onClick={onMainMenuExpansionChange}
				className={addPrefix("nav__trigger")}
				key="hamburgerButton"
				title={
					m?.mainMenuExpanded
						? localizer(
								localizableFromLocalizationTreeMap(
									FRAME_RESOURCE_KEYS.frame.mainMenu.smallDevice.closeMenuButtonTitle,
									DEFAULT_TRANSLATIONS
								)
							)
						: localizer(
								localizableFromLocalizationTreeMap(
									FRAME_RESOURCE_KEYS.frame.mainMenu.smallDevice.openMenuButtonTitle,
									DEFAULT_TRANSLATIONS
								)
							)
				}
				aria-haspopup
				aria-expanded={m?.mainMenuExpanded}
				buttonRef={r => {
					if (hamburgerButtonRef.current !== r) {
						hamburgerButtonRef.current = r;
					}
				}}
			/>
		);

		leftViews.push(hamburgerButton);
	}
	if (props.logoImage) {
		leftViews.push(props.logoImage);
	}
	leftViews.push(props.title);

	// Add custom header items
	if (props.additionalHeaderItems) {
		const leftItems = props.additionalHeaderItems.filter(
			item => item.orientation === "leftSlots-right"
		);
		const rightItems = props.additionalHeaderItems.filter(
			item => item.orientation === "rightSlots-left"
		);

		leftViews.push(...leftItems.map(item => item.item));
		rightViews.unshift(...rightItems.map(item => item.item));
	}

	const MenuComponent = props.mainMenuComponent ?? DynamicMainMenu;
	const menuId = createMenuIdFromRegionReference(props.regionReference);

	const main = (
		<div>
			{props.globalMessageBox}
			<ApplicationHeader leftSlots={leftViews} rightSlots={rightViews} key="header" />
			<MenuComponent
				id={menuId}
				mobileMode={props.mobileMode}
				expanded={m?.mainMenuExpanded ?? false}
				onMenuItemClick={props.mobileMode ? onMainMenuExpansionChange : noop}
				key="menu"
				triggerElement={hamburgerButtonRef}
			/>
		</div>
	);

	const handleOnExpansionChange = useCallback(() => {
		onSubExpanded(!subExpanded);
	}, [onSubExpanded, subExpanded]);

	return (
		<ApplicationFrame
			main={props.hideHeader ? null : main}
			contentToolbar={props.contentNavigationBar}
			subToolbar={props.sidebarNavigationBar}
			sub={props.sidebar}
			subExpanded={subExpanded}
			subExpandedState={props.subExpandedState}
			onExpansionChange={handleOnExpansionChange}
			content={props.content}
			footer={props.footer}
			useToggleButton={props.disableMobileNavigation}
			disableCollapsingSub={props.disableCollapsingSub}
			htmlAttributes={props.htmlAttributes}
		/>
	);
}

PageTemplate.whyDidYouRender = true;

/**
 * @experimental
 */
export interface ApplicationFrameLayoutPropsNG extends LayoutPropsNG {
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
	readonly footer?: ReactNode;

	/**
	 * Optional component that renders a title inside the navigation bar (mobile
	 * only). Normally, the component should only render
	 * a string.
	 */
	readonly navigationBarTitle?: ReactNode;

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
	 * before, this came from AppModel settings for appframe
	 */
	readonly disableCollapsingSub?: boolean;
	/**
	 * before, this came from AppModel settings for appframe
	 */
	readonly subExpandedState?: "maximized" | "minimized";
	/**
	 * before, this came from AppModel settings for appframe
	 */
	readonly subExpanded?: boolean;

	/**
	 *
	 * before, this was part of the layout itself
	 *
	 * Whether the content layout shows multiple views
	 * in mobile mode.
	 */
	readonly multipleViewsContent?: boolean;

	/**
	 * before, this was part of the layout itself
	 *
	 * An optional function which needs to return the index of
	 * the view after which the layout clears the region.
	 * For example if there are 4 views [v1, v2, v3, v4] and the
	 * layout only shows the last two views, "getClearedAfterViewIndex"
	 * needs to return "1"
	 */
	getClearedAfterViewIndex?(
		layout: LayoutNG,
		views: ViewNG[]
	): ((size?: SizeDetectorProps.Size) => number | undefined) | undefined;
}

/**
 * @experimental
 */
export const ApplicationFrameLayoutNGComponent = memo(ApplicationFrameLayoutNGComponentInternal);

/**
 * @experimental
 *
 * A layout that uses the ApplicationFrame widget to position regions and views.
 * Should only be used with `DynamicConfiguration`.
 */
export const ApplicationFrameLayoutNG: LayoutNG<ApplicationFrameLayoutPropsNG> = {
	component: ApplicationFrameLayoutNGComponent
};

function createMenuIdFromRegionReference(ref: RegionReferenceNG): string {
	return ref === ROOT_REGION_REF
		? "root"
		: `root.${ref.substring(1).split("/").map(String.prototype.toLowerCase).join(".")}`;
}
