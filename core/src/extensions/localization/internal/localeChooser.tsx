// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { useCallback, useContext, type ComponentType, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";

import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import { SizeContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-context.js";

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
