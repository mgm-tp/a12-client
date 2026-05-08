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

import type { JSX } from "react";
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";

import { LocaleActions, LocaleSelectors } from "@com.mgmtp.a12.client/client-core";
import { isWdyrEnabled, toggleWdyr } from "@com.mgmtp.a12.devtools/why-did-you-render";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import { Locale } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";
import { HeaderTrigger } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/header-trigger/header-trigger.view.js";
import { Icon } from "@com.mgmtp.a12.widgets/widgets-core/lib/icon/main/icon.view.js";
import { List } from "@com.mgmtp.a12.widgets/widgets-core/lib/list/main/list.view.js";
import { PopUpMenu } from "@com.mgmtp.a12.widgets/widgets-core/lib/pop-up-menu/main/pop-up-menu.view.js";

import { isDevelopmentMode } from "../config/development.js";
import { ThemeContext } from "../theme-provider.js";

export function Settings(): JSX.Element {
	return (
		<PopUpMenu triggerElement={<HeaderTrigger graphic="settings" />}>
			<List>
				<ThemeSwitcher />
				<LocaleSwitcher />
				{isDevelopmentMode() && <WhyDidYouRenderToggle />}
			</List>
		</PopUpMenu>
	);
}

function ThemeSwitcher(): JSX.Element {
	const { localizer } = useContext(LocalizerContext);
	const { themes, setTheme, theme: currentTheme } = useContext(ThemeContext);

	return (
		<>
			<List.SubHeader fill>{localizer({ key: "theme.title" })}</List.SubHeader>
			{themes.map(theme => (
				<List.Item
					text={localizer({ key: `theme.${theme}` })}
					meta={currentTheme === theme && <Icon>check</Icon>}
					key={theme}
					onClick={() => setTheme(theme)}
				/>
			))}
		</>
	);
}

const DEVAPP_LOCALES = [Locale.fromString("de_DE") as Locale, Locale.fromString("en_US") as Locale];

function LocaleSwitcher(): JSX.Element {
	const localizer = useContext(LocalizerContext).localizer;
	const dispatch = useDispatch();
	const currentLocale = useSelector(LocaleSelectors.locale());

	const onValueChanged = (locale: Locale) => {
		dispatch(LocaleActions.set(locale));
	};

	return (
		<>
			<List.SubHeader fill>{localizer({ key: "language.title" })}</List.SubHeader>
			{DEVAPP_LOCALES.map(locale => (
				<List.Item
					text={Locale.toString(locale)}
					meta={currentLocale === locale && <Icon>check</Icon>}
					key={Locale.toString(locale)}
					onClick={() => onValueChanged(locale)}
				/>
			))}
		</>
	);
}

function WhyDidYouRenderToggle(): JSX.Element {
	return (
		<>
			<List.SubHeader fill>Devtools</List.SubHeader>
			<List.Item
				text="WhyDidYouRender"
				title="Toggle @welldone-software/why-did-you-render"
				meta={isWdyrEnabled() ? <Icon>check</Icon> : undefined}
				onClick={toggleWdyr}
			/>
		</>
	);
}
