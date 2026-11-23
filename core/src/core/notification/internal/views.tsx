// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
	export const Frame: ComponentType<Frame.PropsType> = NotificationFrame;
}
