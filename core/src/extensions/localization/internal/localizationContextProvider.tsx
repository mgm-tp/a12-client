// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { useMemo, type JSX, type PropsWithChildren } from "react";
import { useSelector } from "react-redux";

import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import {
	defaultDataFormats,
	defaultLocalizerFactory,
	defaultValueConversion
} from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";
import {
	A11YLanguageContext,
	getA11yResource
} from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/a11y-localization/language-context.js";
import { DateTimeContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/date-time/date-time-context.js";

import type { A12ApplicationConfig } from "../../../core/application/index.js";
import { LocaleSelectors } from "../../../core/locale/internal/selectors.js";

/**
 * @internal
 */
export function makeLocalizationContextProvider(cfg: A12ApplicationConfig) {
	return function LocalizationContextProvider(props: PropsWithChildren): JSX.Element {
		const locale = useSelector(LocaleSelectors.locale());
		const localizerContextValue = useMemo<LocalizerContext.Type>(() => {
			const dataFormats = defaultDataFormats(locale);
			const conversion = defaultValueConversion(dataFormats);
			const localizer = defaultLocalizerFactory({
				locale,
				conversion,
				dataFormats,
				translationSource: cfg.localization.translationSource
			});
			return { locale, conversion, dataFormats, localizer };
		}, [locale]);

		const a11yLanguageContextValue = useMemo(
			() => getA11yResource(locale.language),
			[locale.language]
		);

		const dateTimeContextValue = useMemo(
			() => cfg.localization.getDateTimeResource?.(locale),
			[locale]
		);

		const children = (
			<LocalizerContext.Provider value={localizerContextValue}>
				<A11YLanguageContext.Provider value={a11yLanguageContextValue}>
					{props.children}
				</A11YLanguageContext.Provider>
			</LocalizerContext.Provider>
		);

		return dateTimeContextValue ? (
			<DateTimeContext.Provider value={dateTimeContextValue}>{children}</DateTimeContext.Provider>
		) : (
			children
		);
	};
}
