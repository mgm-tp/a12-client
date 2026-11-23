// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationWithConfiguredFeature } from "../../../core/application/internal/factories/applicationConfig.js";
import {
	addWrapper,
	combineFeatures,
	modifyLayout,
	setConfigured
} from "../../../core/application/internal/factories/applicationFactory.js";

import { type ApplicationWithLocalizationSupportConfig } from "./applicationConfig.js";
import { addLocalizationSupportToApplicationFrameLayout } from "./localeChooser.js";
import { makeLocalizationContextProvider } from "./localizationContextProvider.js";

/**
 * @experimental
 */
export const addLocalizationContextProvider = <T extends ApplicationWithLocalizationSupportConfig>(
	cfg: T
) => addWrapper<T>(makeLocalizationContextProvider(cfg))(cfg);

/**
 * @experimental
 */
export const addLocaleChooser = <T extends ApplicationWithLocalizationSupportConfig>(cfg: T) => {
	const addLocaleChooser = cfg.localization.addLocaleChooser ?? "on-demand";
	if (
		addLocaleChooser === "never" ||
		(addLocaleChooser === "on-demand" && cfg.localization.supportedLocales.length < 2)
	) {
		return cfg;
	}
	return modifyLayout<T>(
		"ApplicationFrame",
		addLocalizationSupportToApplicationFrameLayout(cfg)
	)(cfg);
};

/**
 * @experimental
 */
export const withLocalization = <T extends ApplicationWithLocalizationSupportConfig>(
	cfg: T
): ApplicationWithConfiguredFeature<T, "localization"> =>
	setConfigured<T, "localization">("localization")(
		combineFeatures(addLocalizationContextProvider, addLocaleChooser)(cfg)
	);
