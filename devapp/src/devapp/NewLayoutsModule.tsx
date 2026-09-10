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

import type { JSX } from "react";
import { useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { styled } from "styled-components";

import type {
	DynamicConfiguration,
	ApplicationFrameLayoutPropsNG,
	LayoutNG,
	MasterDetailLayoutPropsNG,
	ViewNG
} from "@com.mgmtp.a12.client/client-core";
import {
	Activity,
	ActivityActions,
	ActivitySelectors,
	ApplicationActions,
	ClientWidgetMapContext,
	DynamicModelSelectors,
	ApplicationFrameLayoutNGComponent,
	FrameViews,
	MasterDetailRegionLayoutNG,
	NullRegionLayoutNG,
	StackRegionLayoutNG,
	LOCALE_RESOURCE_KEYS
} from "@com.mgmtp.a12.client/client-core";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { GlobalMessageBox } from "@com.mgmtp.a12.widgets/widgets-core/lib/global-message-box/main/global-message-box.view.js";
import { Icon } from "@com.mgmtp.a12.widgets/widgets-core/lib/icon/main/icon.view.js";
import type { ApplicationFrameProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/application-frame/main/application-frame.api.js";
import { ApplicationFrame } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/application-frame/main/application-frame.view.js";
import { ButtonGroupContainer } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/button-group-container/main/button-group-container.view.js";
import type { MasterDetailProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/master-detail/main/master-detail.api.js";
import { MasterDetail } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/master-detail/main/master-detail.view.js";
import type { ResizeOptions } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/resizable/resize-handler.api.js";
import { SizeContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-context.js";
import type { SizeDetectorProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-detector.api.js";
import { HintTooltip } from "@com.mgmtp.a12.widgets/widgets-core/lib/tooltip/hint/main/hint.view.js";

import { Settings } from "./components/settings.js";
import { isDevelopmentMode } from "./config/development.js";
import { MainMenu } from "./main-menu.js";
import type { SampleApplicationError } from "./modules/error_handling/errorHandling/errors.js";
import { DevAppActions } from "./store/actions.js";
import { ThemeContext } from "./theme-provider.js";
import isOnSmallDevice from "./utils/isOnSmallDevice.js";
import { VersionMenu } from "./version/views.js";

/** additional header button only visible in mobile mode to toggle the main menu */
const mobileMenuToggleButton: FrameViews.HeaderItemProps = {
	item: (
		<FrameViews.MainMenuContext.Consumer>
			{contextProps => {
				function toggleSidebar(): void {
					contextProps?.setMainMenuExpanded(!contextProps.mainMenuExpanded);
				}
				return <Button secondary icon={<Icon>compare_arrows</Icon>} onClick={toggleSidebar} />;
			}}
		</FrameViews.MainMenuContext.Consumer>
	),
	orientation: "leftSlots-right"
};

const Link = styled.a`
	height: 32px;
	display: flex;
`;
const LogoImage = styled.img`
	height: 32px;
`;

function Logo(): JSX.Element {
	const { theme } = useContext(ThemeContext);
	const dispatch = useDispatch();
	const suffix = theme.includes("flat") ? "_flat" : "";
	const logoURL = `./images/a12_logo${suffix}.svg`;

	return (
		<Link
			onClick={() =>
				dispatch(
					ApplicationActions.startMainActivityRequested({ descriptor: { section: "welcome" } })
				)
			}
			href="#"
		>
			<LogoImage src={logoURL} />
		</Link>
	);
}

const logo = <Logo />;

function Title(): JSX.Element {
	const localizer = useContext(LocalizerContext).localizer;
	const dispatch = useDispatch();
	return (
		<span
			onClick={() =>
				dispatch(
					ApplicationActions.startMainActivityRequested({ descriptor: { section: "welcome" } })
				)
			}
			style={{ cursor: "Pointer" }}
		>
			{localizer({ key: LOCALE_RESOURCE_KEYS.application.title })}
		</span>
	);
}
const title = <Title />;

/** Example for additional header items */
const additionalHeaderItems: readonly FrameViews.HeaderItemProps[] = [
	...(isDevelopmentMode()
		? [
				{
					item: <HintTooltip text="Example for an additional header item on the left" />,
					orientation: "leftSlots-right" as FrameViews.HeaderItemProps["orientation"]
				}
			]
		: []),
	{
		item: <Settings />,
		orientation: "rightSlots-left"
	},
	{
		item: <VersionMenu />,
		orientation: "rightSlots-left"
	}
];

function DevFooter(): JSX.Element {
	const dispatch = useDispatch();
	return (
		<ButtonGroupContainer
			rightSlotButtons={[
				{
					onClick: () => dispatch(DevAppActions.initialization.started()),
					icon: <Icon>meeting_room</Icon>,
					title: "Triggers application initialization"
				},
				{
					onClick: () => dispatch(DevAppActions.ResetApplication.resetRequested()),
					icon: <Icon>no_meeting_room</Icon>,
					title: "Triggers application reset"
				},
				{
					onClick: () => dispatch(DevAppActions.triggerStoreUpdate()),
					icon: <Icon>update</Icon>,
					title: "Trigger Store Update"
				}
			]}
		/>
	);
}

const devFooter = <DevFooter />;

const appFrameSubResizeOptions: ResizeOptions = {
	minWidth: 200,
	maxWidth: 800
};

const DevappApplicationFrameComponent = (props: ApplicationFrameProps) => {
	return <ApplicationFrame {...props} subResizableOptions={appFrameSubResizeOptions} />;
};

/**
 * custom app frame that adds a global message box for errors, a logo and
 * version information and that allows resizing the sidebar
 */
export function DevappApplicationFrameLayout(props: ApplicationFrameLayoutPropsNG): JSX.Element {
	const activityId = useSelector(state => ActivitySelectors.latestActivity()(state)?.id) ?? "";
	const subsystemError = useSelector(
		ActivitySelectors.activityPropById(activityId, a => {
			const error = Activity.findDefaultDataHolder(a)?.error as SampleApplicationError;
			return error?.errorCode === "SAMPLE_SUBSYSTEM_NOT_AVAILABLE" ? error.subsystem : undefined;
		})
	);

	const dispatch = useDispatch();

	const globalMessageBox = subsystemError ? (
		<GlobalMessageBox
			variant="error"
			content={`DevApp error: Subsystem "${subsystemError}" is not available`}
			actions={[
				<Button invert key="wait">
					Wait
				</Button>,
				<Button invert key="try-again">
					Try Again
				</Button>,
				<Button
					primary
					invert
					onClick={() => dispatch(ActivityActions.clearError({ activityId }))}
					key="cancel"
				>
					Cancel
				</Button>
			]}
		/>
	) : undefined;

	const smallDevice = isOnSmallDevice(useContext(SizeContext).currentSize);

	const items = useMemo(
		() => [...(smallDevice ? [mobileMenuToggleButton] : []), ...additionalHeaderItems],
		[smallDevice]
	);

	// we would need to check for Dashboard as well here, but we don't have
	// something to "match against"
	const isNullLayout = useSelector(state => {
		const layoutForContent = DynamicModelSelectors.dynamicRegion(
			props.subRegionRefs?.find(ref => ref.endsWith("CONTENT")) ?? ""
		)(state)?.layout;

		return layoutForContent === NullRegionLayoutNG;
	});

	const DefaultClientWidgetMap = useContext(ClientWidgetMapContext);

	const widgetMap = {
		...DefaultClientWidgetMap,
		ApplicationFrame: DevappApplicationFrameComponent
	};

	return (
		<ClientWidgetMapContext.Provider value={widgetMap}>
			<ApplicationFrameLayoutNGComponent
				{...props}
				globalMessageBox={globalMessageBox}
				logo={logo}
				title={title}
				mainMenuComponent={MainMenu}
				additionalHeaderItems={items}
				footer={isDevelopmentMode() ? devFooter : undefined}
				multipleViewsContent={isNullLayout}
				getClearedAfterViewIndex={getClearedAfterViewIndex}
			/>
		</ClientWidgetMapContext.Provider>
	);
}

function getClearedAfterViewIndex(layout: LayoutNG, views: ViewNG[]) {
	return layout === MasterDetailRegionLayoutNG
		? (size?: SizeDetectorProps.Size) => {
				if (isOnSmallDevice(size) && views.length > 1) {
					return views.length - 2;
				}

				return undefined;
			}
		: undefined;
}

const mdFirstViewResizableOptions: MasterDetailProps["firstViewResizableOptions"] = {
	minWidth: "5%",
	maxWidth: "95%"
};

function ResizableMasterDetail(props: MasterDetailProps): JSX.Element {
	return <MasterDetail {...props} firstViewResizableOptions={mdFirstViewResizableOptions} />;
}

function DevappMasterDetailRegionLayout(props: MasterDetailLayoutPropsNG): JSX.Element {
	const DefaultClientWidgetMap = useContext(ClientWidgetMapContext);

	const customMasterDetailLayoutWidgetMap = {
		...DefaultClientWidgetMap,
		MasterDetail: ResizableMasterDetail
	};

	return (
		<ClientWidgetMapContext.Provider value={customMasterDetailLayoutWidgetMap}>
			<MasterDetailRegionLayoutNG.component {...props} />
		</ClientWidgetMapContext.Provider>
	);
}

// We still want to have an Application Frame Layout with the three standard
// subregions, but they should use the dynamic layout components.
// Without this, the adapter module will still use the old layouts (that do not
// know about dynamic configuration).
export const NewLayoutsModule: DynamicConfiguration = {
	id: "thisModuleProvidesTheNewLayoutComponents",
	regions: [
		{
			name: "", // the root region has no name!
			layout: { component: DevappApplicationFrameLayout },
			subRegions: [
				{
					name: "CONTENT",
					layout: { component: DevappMasterDetailRegionLayout }
				},
				{
					name: "SIDEBAR",
					layout: NullRegionLayoutNG
				},
				{
					name: "MODAL",
					layout: StackRegionLayoutNG
				}
			]
		}
	]
};
