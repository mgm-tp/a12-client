// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { actionCreatorFactory } from "typescript-fsa";

import type { Notification } from "./notification.js";

const factory = actionCreatorFactory("notification");

/**
 * All notification related actions.
 */
export namespace NotificationActions {
	/**
	 * This action is intended to add a notification to the store.
	 */
	export const add = factory<Omit<Notification, "id">>("add");

	/**
	 * This action is intended to remove notification from the store.
	 */
	export const remove = factory<(string | number)[]>("remove");

	/**
	 * This action is intended to remove all notification with the given activity ids from the store.
	 */
	export const removeByActivityIds = factory<string[]>("remove_by_activity_ids");
}
