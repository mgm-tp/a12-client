// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { AnyAction, Reducer } from "redux";

import type { Locale } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/Locale.js";

import { LocaleActions } from "./actions.js";
import { DEFAULT_LOCALE } from "./localeHandling.js";

/**
 * Locale related reducers
 */
export namespace LocaleReducers {
	/**
	 * Locale reducer
	 */
	export const locale: Reducer = (
		oldLocale: Locale = DEFAULT_LOCALE,
		action: AnyAction
	): Locale => {
		return LocaleActions.set.match(action) ? action.payload : oldLocale;
	};
}
