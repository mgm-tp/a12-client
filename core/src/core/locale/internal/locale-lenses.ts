// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Locale } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";

import type { Lens } from "../../lenses.js";

import { LocaleSelectors } from "./selectors.js";

const localeLens: Lens<object, Locale> = {
	get: LocaleSelectors.locale(),
	set: locale => s => (locale !== localeLens.get(s) ? { ...s, locale } : s)
};

/**
 * Functions to access the locale slice inside the Client state.
 */
export const LocaleLenses = {
	/**
	 * Lens for the locale slice.
	 */
	locale: localeLens
};
