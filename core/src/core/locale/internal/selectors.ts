// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Locale } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/Locale.js";

import type { Selector } from "../../store/index.js";
import { createSliceSelector } from "../../store/internal/selectors.js";
import { isRecord } from "../../utils.js";

function isLocaleSlice(slice: unknown): slice is Locale {
	return isRecord(slice) && typeof slice.language === "string" && typeof slice.country === "string";
}

/**
 * Locale related selectors
 */
export namespace LocaleSelectors {
	/**
	 * Select the current locale
	 */
	export function locale(): Selector<Locale> {
		return createSliceSelector("locale", isLocaleSlice);
	}
}
