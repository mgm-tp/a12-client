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

import type { ComponentType, HTMLAttributes, ReactNode } from "react";
import { type JSX, type ReactElement, useContext, useRef } from "react";

import { localizableFromLocalizationTreeMap } from "@com.mgmtp.a12.utils/utils-localization";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react";
import { addPrefix, noop } from "@com.mgmtp.a12.widgets/widgets-core";

import { ClientWidgetMapContext } from "../../../../ClientWidgetMap.js";
import { LOCALE_RESOURCE_KEYS } from "../../../../locale/internal/languages/keys.js";
import type { ApplicationModel } from "../../../../model/internal/ApplicationModel.js";
import MainMenuComponent, { type MainMenuProps } from "../../components/MainMenu.js";
import {
	DEFAULT_TRANSLATIONS,
	RESOURCE_KEYS as FRAME_RESOURCE_KEYS
} from "../../languages/index.js";

import type { HeaderItemProps } from "./ApplicationFrameLayoutProps.js";

/** @internal */
export interface PageTemplateProps {
	readonly globalMessageBox?: ReactNode;
	readonly title: ReactNode;
	readonly logoImage?: ReactNode;
	readonly content: ReactNode;
	readonly sidebar: ReactNode;
	readonly mobileMode: boolean;
	readonly mainMenuExpanded: boolean;
	onMainMenuExpansionChange(): void;
	readonly subExpanded: boolean;
	readonly subExpandedState?: "minimized" | "maximized";
	onSubExpanded(expanded: boolean): void;
	readonly hideHeader?: boolean;
	readonly contentNavigationBar?: ReactNode;
	readonly sidebarNavigationBar?: ReactNode;
	readonly disableMobileNavigation?: boolean;
	readonly htmlAttributes?: {
		readonly headerAttributes?: HTMLAttributes<HTMLDivElement>;
		readonly contentAttributes?: HTMLAttributes<HTMLDivElement>;
		readonly footerAttributes?: HTMLAttributes<HTMLDivElement>;
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

/** @internal */
export function PageTemplate(props: PageTemplateProps): JSX.Element {
	const rightViews = [];
	const leftViews = [];

	const { Icon, Button, ApplicationHeader, ApplicationFrame } = useContext(ClientWidgetMapContext);
	const { localizer } = useContext(LocalizerContext);

	const hamburgerButtonRef = useRef<HTMLElement | null>(null);
	if (props.mobileMode) {
		const hamburgerIcon = <Icon>menu</Icon>;

		const hamburgerButton = (
			<Button
				icon={hamburgerIcon}
				onClick={props.onMainMenuExpansionChange}
				className={addPrefix("nav__trigger")}
				key="hamburgerButton"
				title={
					props.mainMenuExpanded
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
				aria-expanded={props.mainMenuExpanded}
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
	leftViews.push(props.title ?? localizer({ key: LOCALE_RESOURCE_KEYS.application.title }));

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

	return (
		<ApplicationFrame
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

function createMenuIdFromRegionReference(ref: ApplicationModel.Region.Reference): string {
	return ref.length === 0 ? "root" : `root.${ref.map(String.prototype.toLowerCase).join(".")}`;
}
