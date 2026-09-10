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

import type { Localizable } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/Localizable.js";

/**
 * Notifications are displayed as toasts.
 */
export interface Notification {
	/**
	 * Needs to be unique.
	 */
	readonly id: string;

	/**
	 * The localizable descriptor for the notification title
	 */
	readonly title?: Localizable;

	/**
	 * The localizable descriptor for the notification message
	 */
	readonly message?: Localizable;

	/**
	 * If `componentId` is provided, the custom notification renderer, that is
	 * provided to the {@NotificationViews.Frame} component, will be used.
	 */
	readonly componentId?: string;

	/**
	 * Activity id to which this notification is bounded.
	 * If set, the notification is closed along with the activity.
	 */
	readonly activityId?: string;

	/**
	 * The position of the corner, in which the notification toast is displayed
	 */
	readonly position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";

	/**
	 * The severity level of the notification
	 */
	readonly severity?: "info" | "success" | "warning" | "error";

	/**
	 * Duration of display in ms. If given, the toast will be displayed for
	 * the given time and then disappear. If absent, the toast will be displayed
	 * permanently and has to be closed by the user.
	 */
	readonly duration?: number;

	/**
	 * Icon is the name from [material icons](https://material.io/icons/).
	 */
	readonly icon?: string;
}
