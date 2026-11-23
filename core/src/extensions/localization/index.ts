// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/**
 * This package contains functionality related to the A12 localization feature.
 *
 * Please refer to the Localization documentation for a general description of the
 * localization feature.
 *
 * @packageDocumentation
 */

export type {
	ApplicationWithLocalizationSupportConfig,
	LocalizedLocale
} from "./internal/applicationConfig.js";
export {
	addLocaleChooser,
	addLocalizationContextProvider,
	withLocalization
} from "./internal/applicationFactory.js";
