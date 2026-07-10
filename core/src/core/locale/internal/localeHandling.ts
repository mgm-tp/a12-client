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

import { Locale } from "@com.mgmtp.a12.utils/utils-localization";

import { StoreFactories } from "../../store/index.js";

import { LocaleActions } from "./actions.js";
import { LOCALE_LOCAL_STORAGE_KEY } from "./keys.js";

/** @internal */
export const DEFAULT_LOCALE = Locale.fromString("en_US") as Locale;

/** @internal */
export const languagePersistingMiddleware = StoreFactories.createMiddleware((_, next, action) => {
	if (LocaleActions.set.match(action)) {
		localStorage.setItem(LOCALE_LOCAL_STORAGE_KEY, Locale.toString(action.payload));

		setHtmlLangAttribute(action.payload);
	}

	return next(action);
});

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
