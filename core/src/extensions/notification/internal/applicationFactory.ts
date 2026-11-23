// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type {
	A12ApplicationConfig,
	RequireFeatures
} from "../../../core/application/internal/factories/applicationConfig.js";
import {
	addWrapper,
	combineFeatures,
	setConfigured
} from "../../../core/application/internal/factories/applicationFactory.js";
import { NotificationViews } from "../../../core/notification/internal/views.js";

declare module "../../../core/application/internal/factories/applicationConfig.js" {
	interface A12ApplicationConfig {
		notifications?: unknown;
	}
}

/**
 * @experimental
 */
export type ApplicationWithNotificationConfig = RequireFeatures<
	A12ApplicationConfig,
	{ notifications?: never }
>;

/**
 * @experimental
 */
export const addNotificationFrame = <T extends ApplicationWithNotificationConfig>(cfg: T) =>
	addWrapper<T>(NotificationViews.Frame)(cfg);

/**
 * @experimental
 */
export const withNotifications = <T extends ApplicationWithNotificationConfig>(cfg: T) =>
	setConfigured<T, "notifications">("notifications")(combineFeatures(addNotificationFrame)(cfg));
