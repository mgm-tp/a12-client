// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/**
 * Structures to work with locales.
 *
 * Note: Setting the initial locale of the Client requires passing it during
 * application startup by adding a LocaleActions.set(initialLocale)
 * action to ApplicationFactories.createApplicationSetup.
 *
 * @packageDocumentation
 */

export { LocaleActions } from "./internal/actions.js";
export { RESOURCE_KEYS as LOCALE_RESOURCE_KEYS } from "./internal/languages/index.js";
export { LocaleReducers } from "./internal/reducers.js";
export { LocaleSelectors } from "./internal/selectors.js";

export { LocaleLenses } from "./internal/locale-lenses.js";
