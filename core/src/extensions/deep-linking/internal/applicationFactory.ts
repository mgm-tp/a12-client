// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type {
	A12ApplicationConfig,
	RequireFeatures
} from "../../../core/application/internal/factories/applicationConfig.js";
import {
	addCustomSagas,
	combineFeatures,
	setConfigured
} from "../../../core/application/internal/factories/applicationFactory.js";

import { createSagas, createWelcomePageSaga, type Configuration } from "./factories.js";

declare module "../../../core/application/internal/factories/applicationConfig.js" {
	interface A12ApplicationConfig {
		deepLinking?: {
			config?: Configuration;
			onlyWelcomePage?: true;
		};
	}
}

/**
 * @experimental
 */
export type ApplicationWithDeepLinkingConfig = RequireFeatures<
	A12ApplicationConfig,
	{ deepLinking?: never }
>;

/**
 * @experimental
 */
export const addWelcomePageSaga = <T extends ApplicationWithDeepLinkingConfig>(cfg: T) =>
	addCustomSagas<T>(createWelcomePageSaga(cfg.deepLinking?.config))(cfg);

/**
 * @experimental
 */
export const addDeepLinkingSagas = <T extends ApplicationWithDeepLinkingConfig>(cfg: T) =>
	addCustomSagas<T>(...createSagas(cfg.deepLinking?.config))(cfg);

/**
 * @experimental
 */
export const withDeepLinking = <T extends ApplicationWithDeepLinkingConfig>(cfg: T) =>
	setConfigured<T, "deepLinking">("deepLinking")(
		combineFeatures(cfg.deepLinking?.onlyWelcomePage ? addWelcomePageSaga : addDeepLinkingSagas)(
			cfg
		)
	);
