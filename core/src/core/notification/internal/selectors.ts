// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Selector } from "../../store/index.js";
import { createSliceSelector } from "../../store/internal/selectors.js";

import type { Notification } from "./notification.js";

function isNotificationSlice(slice: unknown): slice is Notification[] {
	return Array.isArray(slice);
}

/**
 * All notification related selectors.
 */
export namespace NotificationSelectors {
	/**
	 * Selects the notification from the store.
	 */
	export function notifications(): Selector<Notification[]> {
		return createSliceSelector("notifications", isNotificationSlice);
	}
}
