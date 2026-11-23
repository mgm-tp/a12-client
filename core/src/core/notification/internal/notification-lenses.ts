// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { modifyWithLens, type Lens, type Modifier } from "../../lenses.js";

import type { Notification } from "./notification.js";
import { NotificationSelectors } from "./selectors.js";

const notificationById = (notificationId: string): Lens<object, Notification | undefined> => {
	return {
		get: s => notificationsLens.get(s).find(n => n.id === notificationId),
		set: n => s => maybeUpdate(notificationId)(n)(s)
	};
};

function maybeUpdate(notificationId: string) {
	return (maybeN: Notification | undefined) => (maybeN ? update(maybeN) : remove(notificationId));
}

function update(n: Notification) {
	return (s: object) =>
		n !== notificationById(n.id).get(s) ? modifyWithLens(notificationsLens)(addOrReplace(n))(s) : s;
}

function remove(notificationId: string) {
	return (s: object) => {
		const idx = notificationsLens.get(s).findIndex(n => n.id === notificationId);
		return idx !== -1 ? modifyWithLens(notificationsLens)(ns => ns.toSpliced(idx, 1))(s) : s;
	};
}

function addOrReplace(n: Notification): Modifier<Notification[]> {
	return ns => {
		const idx = ns.findIndex(existing => existing.id === n.id);
		return idx > -1 ? ns.with(idx, n) : ns.concat(n);
	};
}

const notificationsLens: Lens<object, Notification[]> = {
	get: NotificationSelectors.notifications(),
	set(notifications) {
		return function (s) {
			return notifications !== notificationsLens.get(s)
				? {
						...s,
						notifications
					}
				: s;
		};
	}
};

/**
 * Functions to access the notification slice inside the Client state.
 */
export const NotificationLenses = {
	/**
	 * Lens constructor for a single notification by ID.
	 *
	 * Setting an undefined notification will remove it.
	 */
	notificationById,
	/**
	 * Lens for accessing and updating the whole notifications array at once
	 */
	notifications: notificationsLens
};
