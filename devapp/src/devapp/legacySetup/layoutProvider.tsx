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

import {
	Activity,
	ActivityActions,
	ActivitySelectors,
	ApplicationActions,
	ClientWidgetMapContext,
	FrameFactories,
	FrameViews,
	LOCALE_RESOURCE_KEYS
} from "@com.mgmtp.a12.client/client-core";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react";
import {
	Button,
	GlobalMessageBox,
	Icon,
	type ApplicationFrameProps,
	ApplicationFrame,
	ButtonGroupContainer,
	type ResizeOptions,
	SizeContext,
	HintTooltip
} from "@com.mgmtp.a12.widgets/widgets-core";

import { Settings } from "../components/settings.js";
import { isDevelopmentMode } from "../config/development.js";
import type { SampleApplicationError } from "../modules/error_handling/errorHandling/errors.js";
import { ThemeContext } from "../provider/themeProvider.js";
import { initialization, resetRequested, triggerStoreUpdate } from "../store/actions.js";
import { isOnSmallDevice } from "../utils/isOnSmallDevice.js";
import { VersionMenu } from "../version/views.js";

// --- UI components (replicating NewLayoutsModule internals for classic path) ---

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
					onClick: () => dispatch(initialization.started()),
					icon: <Icon>meeting_room</Icon>,
					title: "Triggers application initialization"
				},
				{
					onClick: () => dispatch(resetRequested()),
					icon: <Icon>no_meeting_room</Icon>,
					title: "Triggers application reset"
				},
				{
					onClick: () => dispatch(triggerStoreUpdate()),
					icon: <Icon>update</Icon>,
					title: "Trigger Store Update"
				}
			]}
		/>
	);
}

const appFrameSubResizeOptions: ResizeOptions = {
	minWidth: 200,
	maxWidth: 800
};

const DevappApplicationFrameComponent = (props: ApplicationFrameProps) => {
	return <ApplicationFrame {...props} subResizableOptions={appFrameSubResizeOptions} />;
};

// --- Classic ApplicationFrame layout with devapp customizations ---

function LegacyApplicationFrameLayout(props: FrameViews.ApplicationFrameLayoutProps): JSX.Element {
	const activityId = useSelector(state => ActivitySelectors.latestActivity()(state)?.id) ?? "";
	const subsystemError = useSelector(
		ActivitySelectors.activityPropById(activityId, a => {
			const error = Activity.findDefaultDataHolder(a)?.error as SampleApplicationError | undefined;
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

	const DefaultClientWidgetMap = useContext(ClientWidgetMapContext);
	const widgetMap = useMemo(
		() => ({
			...DefaultClientWidgetMap,
			ApplicationFrame: DevappApplicationFrameComponent
		}),
		[DefaultClientWidgetMap]
	);

	return (
		<ClientWidgetMapContext.Provider value={widgetMap}>
			<FrameViews.ApplicationFrameLayout
				{...props}
				globalMessageBox={globalMessageBox}
				logo={<Logo />}
				title={<Title />}
				additionalHeaderItems={items}
				footer={isDevelopmentMode() ? <DevFooter /> : undefined}
			/>
		</ClientWidgetMapContext.Provider>
	);
}

/**
 * Layout provider for the legacy entry point.
 * Returns a custom ApplicationFrame layout with devapp branding/chrome,
 * and delegates to the default provider for all other layout names.
 */
export function legacyLayoutProvider(name: string): FrameViews.Layout {
	if (name === "ApplicationFrame") {
		return { component: LegacyApplicationFrameLayout };
	}
	return FrameFactories.layoutProvider(name);
}
