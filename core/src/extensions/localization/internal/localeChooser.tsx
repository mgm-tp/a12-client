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

import { useCallback, useContext, type ComponentType, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";

import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react";
import { SizeContext } from "@com.mgmtp.a12.widgets/widgets-core";

import { ClientWidgetMapContext } from "../../../core/ClientWidgetMap.js";
import type { FrameViews } from "../../../core/frame/internal/views.js";
import { LocaleActions } from "../../../core/locale/internal/actions.js";
import { LocaleSelectors } from "../../../core/locale/internal/selectors.js";
import { isOnSmallDevice } from "../../../core/view/internal/size-context.js";

import type {
	ApplicationWithLocalizationSupportConfig,
	LocalizedLocale
} from "./applicationConfig.js";

interface LocaleChooserProps {
	readonly locales: LocalizedLocale[];
}

function LocaleChooser({ locales }: LocaleChooserProps): ReactNode {
	const dispatch = useDispatch();
	const { localizer } = useContext(LocalizerContext);
	const { currentSize } = useContext(SizeContext);
	const mobileMode = isOnSmallDevice(currentSize);
	const locale = useSelector(LocaleSelectors.locale());

	const onSelectLocale = (selectedLocale: LocalizedLocale): void => {
		if (locale.language !== selectedLocale.language) {
			setLocale(selectedLocale);
		}
	};

	const setLocale = (locale: LocalizedLocale): void => {
		dispatch(
			LocaleActions.set({
				country: locale.country,
				language: locale.language
			})
		);
	};

	const getDisplayText = useCallback(
		(locale: LocalizedLocale) => {
			const language = locale.language.toUpperCase();
			return locale.name ? `${localizer(locale.name)}` : language;
		},
		[localizer]
	);

	const { PopUpMenu, HeaderTrigger, List, ListItem, Icon } = useContext(ClientWidgetMapContext);

	return (
		<PopUpMenu
			data-testid={"LocaleChooser"}
			triggerElement={
				<HeaderTrigger
					graphic="public"
					text={mobileMode ? "" : locale.language.toUpperCase()}
					meta={mobileMode ? undefined : "arrow_drop_down"}
					textTitle={locale.country}
				/>
			}
		>
			<List>
				{locales.map(item => (
					<ListItem
						key={item.language}
						text={getDisplayText(item)}
						meta={item.language === locale.language && <Icon>check</Icon>}
						selected={item.language === locale.language}
						onClick={() => onSelectLocale(item)}
					/>
				))}
			</List>
		</PopUpMenu>
	);
}

/**
 * @internal
 */
export const addLocalizationSupportToApplicationFrameLayout =
	(cfg: ApplicationWithLocalizationSupportConfig) => (layout: FrameViews.Layout) => {
		const Component = layout.component as ComponentType<FrameViews.ApplicationFrameLayoutProps>;

		const localeChooserItem = {
			key: "localization-locale-chooser",
			item: <LocaleChooser locales={cfg.localization.supportedLocales} />,
			orientation: "rightSlots-left"
		} as const;

		function AdaptedLayout(props: FrameViews.ApplicationFrameLayoutProps) {
			return (
				<Component
					{...props}
					additionalHeaderItems={[...(props.additionalHeaderItems ?? []), localeChooserItem]}
				/>
			);
		}

		return { ...layout, component: AdaptedLayout };
	};
