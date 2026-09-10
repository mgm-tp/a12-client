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
