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

import {
	addWrapper,
	combineFeatures,
	setConfigured
} from "../../../core/application/internal/factories/applicationFactory.js";
import type { A12ApplicationConfig, RequireFeatures } from "../../../core/index.js";
import { NotificationViews } from "../../../core/notification/internal/views.js";

declare module "../../../core/index.js" {
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
 *
 * NOTE: If your app requires localizations, provide `withLocalization` before this.
 */
export const addNotificationFrame = <T extends ApplicationWithNotificationConfig>(cfg: T) =>
	addWrapper<T>(NotificationViews.Frame)(cfg);

/**
 * @experimental
 *
 * Enables support for notifications by rendering them in a default Widget toast group.
 *
 * NOTE: If your app requires localizations, provide `withLocalization` before this.
 */
export const withNotifications = <T extends ApplicationWithNotificationConfig>(cfg: T) =>
	setConfigured<T, "notifications">("notifications")(combineFeatures(addNotificationFrame)(cfg));
