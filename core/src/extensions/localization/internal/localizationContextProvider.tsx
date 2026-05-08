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
