// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/**
 * This package contains the infrastructure to setup deep-linking.
 *
 * Please be aware that deep-linking does not work in combination with the priorScene property of Scenes
 * (see core/model) documentation.
 *
 * @packageDocumentation
 */
export {
	addDeepLinkingSagas,
	addWelcomePageSaga,
	withDeepLinking
} from "./internal/applicationFactory.js";
export type { ApplicationWithDeepLinkingConfig } from "./internal/applicationFactory.js";
export type { CurrentActivityLocationManager } from "./internal/deepLinkingSagas.js";
export * as DeepLinkingFactories from "./internal/factories.js";
