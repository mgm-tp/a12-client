// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/**
 * This package contains the infrastructure for notifications.
 *
 * By dispatching add action (NotificationActions.add) the notification will be displayed in your application.
 * By dispatching remove action (NotificationActions.remove) the notification will be removed.
 *
 * @packageDocumentation
 */
export { NotificationActions } from "./internal/actions.js";
export { NotificationMiddlewares } from "./internal/middlewares.js";
export type { Notification } from "./internal/notification.js";
export { NotificationReducers } from "./internal/reducers.js";
export { NotificationSelectors } from "./internal/selectors.js";
export { NotificationViews } from "./internal/views.js";

export { NotificationLenses } from "./internal/notification-lenses.js";
