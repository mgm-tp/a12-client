// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { actionCreatorFactory } from "typescript-fsa";

import type { Locale } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/Locale.js";

const factory = actionCreatorFactory("Locale");

/**
 * Actions for the locale
 */
export namespace LocaleActions {
	/**
	 * Change the current locale to the given locale
	 */
	export const set = factory<Locale>("SET");
}
