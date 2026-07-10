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

import type { ComponentType, ReactNode } from "react";

import { NotificationFrame } from "./components/notification-frame.js";
import type { Notification } from "./notification.js";

export interface NotificationViews {
	Frame: ComponentType<NotificationViews.Frame.PropsType>;
}

/**
 * All notification related views.
 */
export namespace NotificationViews {
	export namespace Frame {
		export interface PropsType {
			/**
			 * This renderer is only necessary if some {@link Notification}s specify a custom view.
			 *
			 * @param name is the string value that is provided from the {@link Notification} view property
			 */
			notificationRenderer?(name: string): ComponentType<{
				notification: Notification;
			}>;
			children?: ReactNode;
		}
	}

	/**
	 * The frame that will display the notifications.
	 * Wrapping your entire view with this is recommended.
	 */
	// eslint-disable-next-line no-useless-assignment
	export const Frame: ComponentType<Frame.PropsType> = NotificationFrame;
}
