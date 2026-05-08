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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
