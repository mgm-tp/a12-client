// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
 */

import deepEqual from "fast-deep-equal";
import type {
	ComponentType,
	ContextType,
	HTMLAttributes,
	JSX,
	ReactElement,
	ReactNode
} from "react";
import { Component, createContext, useContext, useMemo, useRef } from "react";
import { connect } from "react-redux";
import type { Action } from "redux";

import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import type { Locale } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/Locale.js";
import { localizableFromLocalizationTreeMap } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/LocalizableFactory.js";
import type { ButtonProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.api.js";
import type { Container } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/base-props.js";
import { addPrefix } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/utils.js";
import { NavigationContentboxContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import type { ApplicationFrameProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/application-frame/main/application-frame.api.js";
import { SizeContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-context.js";
import type { SizeDetectorProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-detector.api.js";

import { ActivityActions, ActivitySelectors } from "../../../activity/index.js";
import { ClientWidgetMapContext, type ClientWidgetMap } from "../../../ClientWidgetMap.js";
import { LOCALE_RESOURCE_KEYS, LocaleSelectors } from "../../../locale/index.js";
import { ApplicationModel, ModelSelectors } from "../../../model/index.js";
import { noop } from "../../../utils.js";
import type { View } from "../../../view/index.js";
import { ViewSelectors } from "../../../view/index.js";
import { isOnSmallDevice } from "../../../view/internal/size-context.js";

import type { MainMenuProps } from "../components/MainMenu.js";
import MainMenuComponent from "../components/MainMenu.js";
import { DEFAULT_TRANSLATIONS, RESOURCE_KEYS as FRAME_RESOURCE_KEYS } from "../languages/index.js";

import type { Layout, LayoutProps, RegionUiProps } from "./LayoutProps.js";
import type { MainMenuContextProps } from "./MainMenuContext.js";
import { MainMenuContext } from "./MainMenuContext.js";
import {
	MobileNavigationAction,
	type ActivityIdMap,
	type RegionInformation,
	type ViewWithRegionReference
} from "./mobile-navigation.js";

interface SubRegion {
	readonly ref: ApplicationModel.Region.Reference;
	readonly component: ComponentType<RegionUiProps>;
}

interface StateProps {
	readonly contentRegion: SubRegion;
	readonly sidebarRegion?: SubRegion;
	readonly modalRegion?: SubRegion;

	readonly locale: Locale;

	readonly activityIdMap: ActivityIdMap;

	readonly sidebar: Region;
	readonly content: Region;

	readonly viewDirectives: ReadonlyArray<ViewWithRegionReference>;

	disableCollapsingSub?: boolean;
	subExpandedState?: "maximized" | "minimized";
	subExpanded: boolean;
}

function removeViewsAndFunctionsFromStateProps({
	sidebar: { views: views1, ...sidebar },
	content: { views: views2, ...content },
	...props
}: StateProps): Record<string, unknown> {
	return {
		...props,
		sidebar: {
			...sidebar,
			views: views1.map(({ ProgressComponent, ...v }) => v)
		},
		content: {
			...content,
			views: views2.map(({ ProgressComponent, ...v }) => v)
		}
	};
}

const StateProps = {
	equals(v1: StateProps, v2: StateProps): boolean {
		// This compares the entire object except the ProgressComponent property of sidebar and content views!
		return deepEqual(
			removeViewsAndFunctionsFromStateProps(v1),
			removeViewsAndFunctionsFromStateProps(v2)
		);
	}
};

interface Region {
	readonly views: View[];
	readonly layout: ApplicationModel.Layout;
}

interface DispatchProps {
	cancelActivities(activityIds: string[]): void;
}

/**
 * Provides state add change functions for the ApplicationFrame sidebar. Note:
 * The state/functions are only provided when at least one {@link View} is
 * present in the sidebar region.
 */
export const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);
export interface SidebarContextProps {
	/** Whether the sidebar is expanded or not */
	readonly subExpanded: boolean;
	/** Callback to set the expansion state of the sidebar */
	setSubExpanded(expanded: boolean): void;
	/** Whether the sidebar is maximized or not */
	readonly subExpandedState?: "minimized" | "maximized";
	/** Callback to maximize or minimize the sidebar */
	setSubExpandedState?(value?: "minimized" | "maximized"): void;
}
SidebarContext.displayName = "SidebarContext";

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
	 * @deprecated since Client 16.1.0. This property will be removed in the next major release.
	 * Use the {@link ClientWidgetMapContext} instead.
	 * A map of components, that will be used instead of the corresponding
	 * default components, if they are provided.
	 */
	readonly widgetMap?: {
		/**
		 * This component is used for the main menu button in the application header
		 * instead of the default button, if it is provided.
		 */
		readonly mainMenuButtonComponent?: ComponentType<ButtonProps>;

		/**
		 * If provided, this component is used as the root component of the ApplicationFrameLayout
		 */
		readonly applicationFrame?: ComponentType<ApplicationFrameProps>;
	};

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

type OwnProps = ApplicationFrameLayoutProps;

interface ApplicationFrameLayoutState {
	readonly subExpanded: boolean;
	readonly subExpandedFromProps: boolean;
	readonly mainMenuExpanded: boolean;

	/** The state of the sidebar before the size went under the sm threshold */
	readonly subExpandedOnLargeDevice: boolean;

	readonly subExpandedState?: "minimized" | "maximized";
	readonly subExpandedStateFromProps?: "maximized" | "minimized";
}

interface AppFrameLayoutProps extends StateProps, OwnProps, DispatchProps {}

/** @internal */
export function ApplicationFrameLayoutWithContext(props: AppFrameLayoutProps): JSX.Element {
	const widgetMapCtx = useContext(ClientWidgetMapContext);

	return (
		<SizeContext.Consumer>
			{value => (
				<ApplicationFrameLayoutComponent
					{...props}
					currentSize={value.currentSize}
					widgetMapCtx={widgetMapCtx}
				/>
			)}
		</SizeContext.Consumer>
	);
}
ApplicationFrameLayoutWithContext.whyDidYouRender = true;

interface AppFrameLayoutComponentProps extends AppFrameLayoutProps {
	currentSize?: SizeDetectorProps.Size;
	/**
	 * Class components can only use a single context (here, this is the SizeContext)
	 * To be able to use the WidgetMap, it is therefore passed as a prop from a wrapper functional component.
	 *
	 * TODO: Remove when refactoring in A12C-3181
	 */
	widgetMapCtx: ClientWidgetMap;
}

/** @internal */
export class ApplicationFrameLayoutComponent extends Component<
	AppFrameLayoutComponentProps,
	ApplicationFrameLayoutState
> {
	static contextType = SizeContext;
	declare context: ContextType<typeof SizeContext> | undefined;

	static whyDidYouRender = true;

	constructor(props: AppFrameLayoutComponentProps) {
		super(props);
		this.state = {
			subExpanded: props.subExpanded,
			subExpandedFromProps: props.subExpanded,
			subExpandedOnLargeDevice: props.subExpanded,
			mainMenuExpanded: false,
			subExpandedState: props.subExpandedState,
			subExpandedStateFromProps: props.subExpandedState
		};
	}

	/**
	 * Collapse the sidebar and remember the old state
	 * when the size changed under the small device threshold.
	 *
	 * Recover the sidebar state when the size changed above the small device
	 * threshold again.
	 *
	 * If the current device size is a small device:
	 *   Expand the sidebar, if there are new activities which added a view to the sidebar
	 *   OR
	 *   If there are only views in the sidebar.
	 *
	 *   Collapse the sidebar if activities got cancelled.
	 */
	componentDidUpdate(prevProps: AppFrameLayoutComponentProps): void {
		if (this.context === undefined) {
			return;
		}

		const currentSize = this.context.currentSize;
		const previousSize = prevProps.currentSize;

		if (!isOnSmallDevice(previousSize) && isOnSmallDevice(currentSize)) {
			this.setState(prevState => ({
				subExpanded: false,
				subExpandedOnLargeDevice: prevState.subExpanded
			}));
		} else if (isOnSmallDevice(previousSize) && !isOnSmallDevice(currentSize)) {
			this.setState({ subExpanded: this.state.subExpandedOnLargeDevice });
		} else if (isOnSmallDevice(currentSize)) {
			if (this.shouldSidebarExpand(prevProps)) {
				this.setState({ subExpanded: true });
			} else if (this.shouldSidebarCollapse(prevProps)) {
				this.setState({ subExpanded: false });
			}
		}
	}

	shouldSidebarExpand(prevProps: StateProps): boolean {
		const newActivities = Object.keys(this.props.activityIdMap).filter(
			a => !Object.keys(prevProps.activityIdMap).includes(a)
		);

		const newActivitiesInSidebar = this.props.sidebar.views.some(
			t => newActivities.find(a => t.activityId === a) !== undefined
		);
		if (newActivitiesInSidebar) {
			return true;
		}

		const onlyViewsInSidebarPresent =
			prevProps.content.views.length > 0 &&
			this.props.content.views.length === 0 &&
			this.props.sidebar.views.length > 0;
		if (onlyViewsInSidebarPresent) {
			return true;
		}

		return false;
	}

	shouldSidebarCollapse(prevProps: StateProps): boolean {
		return (
			Object.keys(prevProps.activityIdMap).length > Object.keys(this.props.activityIdMap).length
		);
	}

	/**
	 * This is used to set subExpandedState and subExpanded in state to the
	 * value from the props when this changes due to a scene change with new
	 * settings.
	 */
	static getDerivedStateFromProps(
		nextProps: AppFrameLayoutComponentProps,
		prevState: ApplicationFrameLayoutState
	): Partial<ApplicationFrameLayoutState> | null {
		if (
			(nextProps.subExpandedState !== prevState.subExpandedStateFromProps &&
				nextProps.subExpandedState !== prevState.subExpandedState) ||
			(nextProps.subExpanded !== prevState.subExpandedFromProps &&
				nextProps.subExpanded !== prevState.subExpanded)
		) {
			return {
				subExpandedState: nextProps.subExpandedState,
				subExpandedStateFromProps: nextProps.subExpandedState,
				subExpanded: nextProps.subExpanded,
				subExpandedFromProps: nextProps.subExpanded,
				subExpandedOnLargeDevice: nextProps.subExpanded
			};
		}

		return null;
	}

	render(): ReactNode {
		const {
			additionalHeaderItems,
			contentRegion,
			errorBoundaryProvider,
			globalMessageBox,
			layoutProvider,
			logo,
			logoURL,
			// TODO: Remove with A12-17777
			// oxlint-disable-next-line typescript/no-deprecated
			widgetMap,
			mainMenuComponent,
			modalRegion,
			progressComponentProvider,
			regionUiProvider,
			sidebarRegion,
			title,
			viewProvider,
			footer,
			widgetMapCtx
		} = this.props;
		const mobileMode = isOnSmallDevice(this.context?.currentSize);
		const mobileNavigationEnabled = mobileMode && this.props.disableMobileNavigation !== true;

		const visibleRegion =
			!this.state.subExpanded || this.props.sidebarRegion === undefined ? "CONTENT" : "SIDEBAR";

		const mobileBackButtonAction = mobileNavigationEnabled
			? this.evaluateMobileNavigationBackButtonAction([visibleRegion])
			: undefined;

		const hideHeaderFooter = mobileBackButtonAction !== undefined;

		const contentLayout = this.props.layoutProvider(this.props.content.layout.name);
		const multipleViewsContent = contentLayout.visibleViews === "multiple";

		const onSidebarBackButtonClicked =
			visibleRegion === "SIDEBAR" && mobileBackButtonAction?.type === "CancelActivity"
				? () => {
						this.props.cancelActivities(mobileBackButtonAction.activitiesToCancel);
					}
				: undefined;

		const onContentBackButtonClicked =
			visibleRegion === "CONTENT" && mobileBackButtonAction
				? mobileBackButtonAction.type === "RegionSwitch"
					? ApplicationModel.Region.Reference.equal(mobileBackButtonAction.switchToRegion, [
							"SIDEBAR"
						])
						? () => this.setState({ subExpanded: true })
						: undefined
					: () => this.props.cancelActivities(mobileBackButtonAction.activitiesToCancel)
				: undefined;

		const contentComponent = (
			<contentRegion.component
				regionReference={contentRegion.ref}
				layoutProvider={layoutProvider}
				regionUiProvider={regionUiProvider}
				viewProvider={viewProvider}
				progressComponentProvider={progressComponentProvider}
				errorBoundaryProvider={errorBoundaryProvider}
			/>
		);

		const content = (
			<ContentWrapper
				multipleViewsContent={multipleViewsContent}
				onContentBackButtonClicked={onContentBackButtonClicked}
				key="content"
			>
				{contentComponent}
			</ContentWrapper>
		);

		const sidebar = sidebarRegion ? (
			<sidebarRegion.component
				regionReference={sidebarRegion.ref}
				layoutProvider={layoutProvider}
				regionUiProvider={regionUiProvider}
				viewProvider={viewProvider}
				progressComponentProvider={progressComponentProvider}
				errorBoundaryProvider={errorBoundaryProvider}
			/>
		) : undefined;

		const NavigationBarTitle = this.props.navigationBarTitle;
		const navigationBarTitle =
			NavigationBarTitle !== undefined ? (
				<NavigationBarTitle visibleViews={this.props.sidebar.views} />
			) : undefined;

		const { ContentBoxBackButton, ContentBoxHeading, ContentBoxTitle } = widgetMapCtx;

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

		const pageTemplate = (
			<>
				<LocalizerContext.Consumer>
					{value => (
						<PageTemplate
							contentNavigationBar={contentNavigationBar}
							sidebarNavigationBar={sidebarNavigationBar}
							globalMessageBox={globalMessageBox}
							title={title ?? value.localizer({ key: LOCALE_RESOURCE_KEYS.application.title })}
							logoImage={logo ?? <FallbackLogo logoURL={logoURL} />}
							content={content}
							sidebar={sidebar}
							mobileMode={mobileMode}
							subExpanded={this.state.subExpanded}
							onSubExpanded={expanded => {
								this.setState({ subExpanded: expanded });
							}}
							mainMenuExpanded={this.state.mainMenuExpanded}
							onMainMenuExpansionChange={() => {
								this.setState(prevState => ({
									mainMenuExpanded: !prevState.mainMenuExpanded
								}));
							}}
							// TODO: Remove with A12-17777
							// oxlint-disable-next-line typescript/no-deprecated
							widgetMap={widgetMap}
							mainMenuComponent={mainMenuComponent}
							permissions={this.props.permissions}
							additionalHeaderItems={additionalHeaderItems}
							footer={hideHeaderFooter ? undefined : footer}
							hideHeader={hideHeaderFooter}
							disableMobileNavigation={this.props.disableMobileNavigation}
							subExpandedState={this.state.subExpandedState}
							disableCollapsingSub={this.props.disableCollapsingSub ?? false}
							htmlAttributes={
								this.state.mainMenuExpanded && isOnSmallDevice(this.context?.currentSize)
									? {
											contentAttributes: { "aria-hidden": true },
											footerAttributes: { "aria-hidden": true }
										}
									: undefined
							}
							regionReference={this.props.regionReference}
						/>
					)}
				</LocalizerContext.Consumer>
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
			</>
		);

		// only set if sidebar is visible
		const sidebarContext: SidebarContextProps | undefined = sidebarRegion
			? {
					subExpanded: this.state.subExpanded,
					setSubExpanded: this.onSetSubExpanded,
					subExpandedState: this.state.subExpandedState,
					setSubExpandedState: this.onSetSubExpandedState
				}
			: undefined;

		const mainMenuContext: MainMenuContextProps = {
			mainMenuExpanded: this.state.mainMenuExpanded,
			setMainMenuExpanded: this.onSetMainMenuExpanded
		};

		// Note: Always render contexts to keep component hierarchy stable and
		// avoid remounts (see A12-14045)
		return (
			<SidebarContextMemoWrapper contextValue={sidebarContext}>
				<MainMenuContext.Provider value={mainMenuContext}>{pageTemplate}</MainMenuContext.Provider>
			</SidebarContextMemoWrapper>
		);
	}

	private readonly onSetSubExpanded: (expanded: boolean) => void = expanded => {
		this.setState({ subExpanded: expanded });
	};

	private readonly onSetSubExpandedState: (value?: "minimized" | "maximized") => void = value => {
		this.setState({ subExpandedState: value });
	};

	private readonly onSetMainMenuExpanded: (expanded: boolean) => void = expanded => {
		this.setState({ mainMenuExpanded: expanded });
	};

	evaluateMobileNavigationBackButtonAction(
		visibleRegion: ApplicationModel.Region.Reference
	): MobileNavigationAction | undefined {
		const currentSize = this.context?.currentSize ?? "lg";
		return MobileNavigationAction.calculate({
			listOfViews: this.props.viewDirectives.filter(
				d => !ApplicationModel.Region.Reference.equal(d.regionReference, ["MODAL"])
			),
			activityIdMap: this.props.activityIdMap,
			regionInformation: [
				this.createRegionInformation("SIDEBAR", currentSize),
				this.createRegionInformation("CONTENT", currentSize)
			],
			visibleRegion
		});
	}

	private createRegionInformation(
		regionName: "SIDEBAR" | "CONTENT",
		currentSize: SizeDetectorProps.Size | undefined
	): RegionInformation {
		const { layout, views } = regionName === "SIDEBAR" ? this.props.sidebar : this.props.content;

		const lp = this.props.layoutProvider(layout.name);

		const clearedAfter = lp.getClearedAfterViewIndex?.({
			layoutProvider: this.props.layoutProvider,
			progressComponentProvider: this.props.progressComponentProvider,
			regionReference: this.props.regionReference,
			regionUiProvider: this.props.regionUiProvider,
			viewProvider: this.props.viewProvider,
			errorBoundaryProvider: this.props.errorBoundaryProvider,
			settings: this.props.settings,
			views
		});

		return {
			regionReference: [regionName],
			clearedAfter: clearedAfter?.(currentSize),
			views
		};
	}
}

function PageTemplate(props: PageTemplate.PropsType): JSX.Element {
	const rightViews = [];
	const leftViews = [];

	const { Icon, Button, ApplicationHeader, ApplicationFrame } = useContext(ClientWidgetMapContext);

	// TODO: Remove with A12-17777
	// oxlint-disable-next-line typescript/no-deprecated
	const { widgetMap } = props;

	const hamburgerButtonRef = useRef<HTMLElement | null>(null);
	if (props.mobileMode) {
		const hamburgerIcon = <Icon>menu</Icon>;
		const HamburgerButtonComponent = widgetMap?.mainMenuButtonComponent ?? Button;

		const hamburgerButton = (
			<LocalizerContext.Consumer>
				{value => (
					<HamburgerButtonComponent
						icon={hamburgerIcon}
						onClick={props.onMainMenuExpansionChange}
						className={addPrefix("nav__trigger")}
						key="hamburgerButton"
						title={
							props.mainMenuExpanded
								? value.localizer(
										localizableFromLocalizationTreeMap(
											FRAME_RESOURCE_KEYS.frame.mainMenu.smallDevice.closeMenuButtonTitle,
											DEFAULT_TRANSLATIONS
										)
									)
								: value.localizer(
										localizableFromLocalizationTreeMap(
											FRAME_RESOURCE_KEYS.frame.mainMenu.smallDevice.openMenuButtonTitle,
											DEFAULT_TRANSLATIONS
										)
									)
						}
						aria-haspopup
						aria-expanded={props.mainMenuExpanded}
						buttonRef={r => {
							if (hamburgerButtonRef.current !== r) {
								hamburgerButtonRef.current = r;
							}
						}}
					/>
				)}
			</LocalizerContext.Consumer>
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
	const MainMenuComponentToUse = props.mainMenuComponent ?? MainMenuComponent;
	const menuId = createMenuIdFromRegionReference(props.regionReference);
	const main = (
		<div>
			{props.globalMessageBox}
			<ApplicationHeader leftSlots={leftViews} rightSlots={rightViews} key="header" />
			<MainMenuComponentToUse
				id={menuId}
				mobileMode={props.mobileMode}
				expanded={props.mainMenuExpanded}
				onMenuItemClick={props.mobileMode ? props.onMainMenuExpansionChange : noop}
				permissions={props.permissions}
				key="menu"
				triggerElement={hamburgerButtonRef}
			/>
		</div>
	);

	const ApplicationFrameComponent = widgetMap?.applicationFrame ?? ApplicationFrame;

	return (
		<ApplicationFrameComponent
			main={props.hideHeader ? null : main}
			contentToolbar={props.contentNavigationBar}
			subToolbar={props.sidebarNavigationBar}
			sub={props.sidebar}
			subExpanded={props.subExpanded}
			subExpandedState={props.subExpandedState}
			onExpansionChange={() => {
				props.onSubExpanded(!props.subExpanded);
			}}
			content={props.content}
			footer={props.footer}
			useToggleButton={props.disableMobileNavigation}
			disableCollapsingSub={props.disableCollapsingSub}
			htmlAttributes={props.htmlAttributes}
		/>
	);
}

/** @internal */
export interface SidebarContextMemoWrapperProps extends Container {
	contextValue: SidebarContextProps | undefined;
}
// extracted to functional component so that we can useMemo
/** @internal */
export const SidebarContextMemoWrapper: ComponentType<SidebarContextMemoWrapperProps> = props => {
	const cv = props.contextValue;
	const deps = [cv?.subExpanded, cv?.setSubExpanded, cv?.subExpandedState, cv?.setSubExpandedState];
	// oxlint-disable-next-line react/exhaustive-deps
	const memoProps = useMemo(() => props.contextValue, deps);
	return <SidebarContext.Provider value={memoProps}>{props.children}</SidebarContext.Provider>;
};

namespace PageTemplate {
	/**
	 * @internal
	 */
	export interface PropsType {
		globalMessageBox?: ReactNode;
		title: ReactNode;
		logoImage?: ReactNode;
		content: ReactNode;
		sidebar: ReactNode;
		mobileMode: boolean;
		mainMenuExpanded: boolean;
		onMainMenuExpansionChange(): void;
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
		 * @deprecated since Client 16.1.0. This property will be removed in the next major release.
		 * Use the {@link ClientWidgetMapContext} instead.
		 *
		 * A map of components, that will be used instead of the corresponding
		 * default components, if they are provided.
		 */
		readonly widgetMap?: {
			/**
			 * This component is used for the main menu button in the application header
			 * instead of the default button, if it is provided.
			 */
			readonly mainMenuButtonComponent?: ComponentType<ButtonProps>;

			/**
			 * If provided, this component is used as the root component of the ApplicationFrameLayout
			 */
			readonly applicationFrame?: ComponentType<ApplicationFrameProps>;
		};

		/**
		 * This component is used for the main menu in the application header
		 * instead of the default main menu, if it is provided.
		 */
		readonly mainMenuComponent?: ComponentType<MainMenuProps>;

		readonly additionalHeaderItems?: ReadonlyArray<HeaderItemProps>;

		/** Optional footer element for the application */
		readonly footer?: ReactElement;

		/**
		 * A list of permission that are used to show user menu entries based on
		 * the permissions from the application model.
		 */
		readonly permissions?: string[];

		readonly disableCollapsingSub: boolean;

		readonly regionReference: ApplicationModel.Region.Reference;
	}
}

function findSubRegionByNameCreator(name: string): (subRegion: SubRegion) => boolean {
	return function findRefByName({ ref }) {
		return ApplicationModel.Region.Reference.name(ref) === name;
	};
}

const ConnectedApplicationFrameLayout: ComponentType<ApplicationFrameLayoutProps> = connect<
	StateProps,
	DispatchProps,
	OwnProps
>(
	function mapStateToProps(state: object, ownProps: OwnProps): StateProps {
		const subRegionRefs = ModelSelectors.subRegionRefs(ownProps.regionReference)(state);
		const subRegions = subRegionRefs.map(ref => ({
			ref,
			component: ownProps.regionUiProvider(ref)
		}));

		if (subRegions.length === 0) {
			if (ownProps.views.length > 0) {
				throw new Error("ApplicationFrameLayout does not support views");
			} else {
				throw new Error("ApplicationFrameLayout: Missing sub-regions");
			}
		}

		const contentRegion = subRegions.find(findSubRegionByNameCreator("CONTENT"));
		if (contentRegion === undefined) {
			throw new Error("ApplicationFrameLayout: No content region found");
		}

		const viewsDirectives = ViewSelectors.allViews()(state).filter(
			view => ActivitySelectors.activityById(view.activityId)(state) !== undefined
		);

		const sidebar = ViewSelectors.region(["SIDEBAR"])(state);
		const content = ViewSelectors.region(["CONTENT"])(state);

		const sidebarRegion =
			sidebar.views.length > 0 ? subRegions.find(findSubRegionByNameCreator("SIDEBAR")) : undefined;

		const modalRegion = subRegions.find(findSubRegionByNameCreator("MODAL"));

		const locale = LocaleSelectors.locale()(state);
		const activities = ActivitySelectors.activities()(state);

		const disableCollapsingSub = ownProps.settings?.disableCollapsingSub;
		const initialSubExpandedState = ownProps.settings?.initialSubExpandedState;
		const initialSubExpanded = ownProps.settings?.initialSubExpanded ?? true;

		return {
			locale,
			contentRegion,
			sidebarRegion,
			modalRegion,
			activityIdMap: Object.fromEntries(
				Object.entries(activities).map(([id, activity]) =>
					activity ? [id, activity?.initiatingActivityId] : []
				) as [string, string | undefined][]
			),
			sidebar,
			content,
			viewDirectives: viewsDirectives,
			disableCollapsingSub: disableCollapsingSub,
			subExpandedState: initialSubExpandedState,
			subExpanded: initialSubExpanded
		};
	},
	{
		cancelActivities(activityIds: string[]): Action {
			return ActivityActions.cancelRequested({ activityIds });
		}
	},
	undefined,
	{ areStatePropsEqual: StateProps.equals }
)(ApplicationFrameLayoutWithContext);

/** @internal */
const layout: Layout = {
	component: ConnectedApplicationFrameLayout
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

function createMenuIdFromRegionReference(ref: ApplicationModel.Region.Reference): string {
	return ref.length === 0 ? "root" : `root.${ref.map(part => part.toLowerCase()).join(".")}`;
}
