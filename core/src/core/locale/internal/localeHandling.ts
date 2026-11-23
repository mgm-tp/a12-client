// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { Locale } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/Locale.js";

import { StoreFactories } from "../../store/index.js";

import { LocaleActions } from "./actions.js";
import { LOCALE_LOCAL_STORAGE_KEY } from "./keys.js";

/** @internal */
export const DEFAULT_LOCALE = Locale.fromString("en_US") as Locale;

/** @internal */
export const languagePersistingMiddleware = StoreFactories.createMiddleware(
	(_api, next, action) => {
		if (LocaleActions.set.match(action)) {
			localStorage.setItem(LOCALE_LOCAL_STORAGE_KEY, Locale.toString(action.payload));

			setHtmlLangAttribute(action.payload);
		}

		return next(action);
	}
);

/** @internal */
export function getLocaleFromStorage(defaultLocale: Locale = DEFAULT_LOCALE): Locale {
	try {
		const localeString = localStorage.getItem(LOCALE_LOCAL_STORAGE_KEY);
		const locale = Locale.fromString(localeString ?? "") as Locale;

		return setHtmlLangAttribute(locale);
	} catch {
		return setHtmlLangAttribute(defaultLocale);
	}
}

/**
 * @internal
 * This function is also called during step tests, where web apis do not exists.
 */
export function setHtmlLangAttribute(locale: Locale): Locale {
	if (typeof document === "undefined") {
		return locale;
	}

	const htmlElement = document.querySelector("html");
	const lang = locale.language;
	if (htmlElement?.getAttribute("lang") !== lang) {
		htmlElement?.setAttribute("lang", lang);
	}

	return locale;
}
