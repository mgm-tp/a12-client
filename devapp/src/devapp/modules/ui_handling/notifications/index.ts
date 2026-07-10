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

import type { Dispatch } from "redux";
import { put } from "typed-redux-saga";

import type {
	Activity,
	DataProvider,
	DynamicConfiguration,
	DynamicFlow,
	DynamicMenu
} from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	ApplicationActions,
	NEW_INSTANCE_IDENTIFIER
} from "@com.mgmtp.a12.client/client-core";

import { withProgressIndicator } from "../../../utils/withProgressIndicator.js";

import { NotificationsSagas } from "./notification-middlewares.js";
import { NotificationsForm } from "./notification-views.js";

const INITIAL_DESCRIPTOR = {
	section: "UIHandling",
	feature: "Notifications",
	model: "NotificationExample-document",
	instance: NEW_INSTANCE_IDENTIFIER
};

function matchesNotifications(descriptor: Activity.Descriptor): boolean {
	return descriptor.section === "UIHandling" && descriptor.feature === "Notifications";
}

const notificationsDataProvider: DataProvider = {
	name: "NotificationsDataProvider",
	canHandle({ operation, dataHolder }) {
		return operation === "load" && dataHolder.descriptor.model === INITIAL_DESCRIPTOR.model;
	},
	*provideData({ activityId }) {
		yield* put(
			ActivityActions.setData({
				activityId,
				data: {
					document: {
						id: NEW_INSTANCE_IDENTIFIER,
						modelId: INITIAL_DESCRIPTOR.model,
						scope: "global",
						severity: "info",
						display_time: "permanent",
						position: "top-left"
					}
				}
			})
		);
	}
};

const dynamicFlows: DynamicFlow[] = [
	{
		name: "ui_handling.notifications",
		scenes: [
			{
				name: "Notifications",
				matches: matchesNotifications,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: withProgressIndicator(NotificationsForm),
							region: "/CONTENT"
						}
					]
				}
			}
		]
	}
];

function onMenuClick(dispatch: Dispatch): void {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: INITIAL_DESCRIPTOR,
				loadingState: "missing"
			}),
			descriptor: {}
		})
	);
}

function selectMenus(state: object): DynamicMenu[] {
	const activities = ActivitySelectors.activitiesByDescriptor(INITIAL_DESCRIPTOR)(state);
	return [
		{
			id: "ui_handling.notifications",
			label: {
				key: "ui_handling.notifications",
				defaults: { en: "Notifications", de: "Benachrichtigungen" }
			},
			action: onMenuClick,
			selected: activities.at(0) !== undefined
		}
	];
}

export const NotificationsModule: DynamicConfiguration = {
	id: "ui_handling.notifications",
	flows: dynamicFlows,
	menus: selectMenus,
	sagas: () => NotificationsSagas,
	dataProviders: () => [notificationsDataProvider]
};
