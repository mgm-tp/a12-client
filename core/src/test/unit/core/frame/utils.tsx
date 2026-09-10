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

import type { AnyAction, Store } from "redux";

import type { Activity, ActivityMap } from "../../../../core/activity/index.js";
import { StoreFactories } from "../../../../core/store/internal/factories.js";
import type { View } from "../../../../core/view/index.js";
import type { ViewNG } from "../../../../core/view/internal/viewNG.js";
import { setupActivityMap } from "../../../api/core/activity/util.js";
import { US_LOCALE } from "../../../utils/localization.js";
import type { ClientState, Config } from "../../../utils/test-utils.js";
import { createApplicationSetup } from "../../../utils/test-utils.js";

export interface ViewWithActivity {
	readonly view: View;
	readonly activity: Activity;
}

export interface ViewWithActivityNG {
	readonly view: ViewNG;
	readonly activity: Activity;
}

export function getViewsAndActivities(viewsWithActivity: ViewWithActivity[]): {
	views: View[];
	activities: ActivityMap;
} {
	return {
		views: viewsWithActivity.map(va => va.view),
		activities: setupActivityMap(viewsWithActivity.map(va => va.activity))
	};
}

export function createViewWithActivity(
	activityId: string,
	viewName: string,
	initiatingActivityId?: string,
	constraints?: object
): ViewWithActivity {
	const activity: Activity = {
		id: activityId,
		descriptor: { model: "CRUD" },
		activationTimestamp: 0,
		dataHolders: [
			{
				descriptor: { model: "CRUD" },
				data: {},
				dirty: false,
				loadingState: "loaded",
				savingState: "saved",
				slices: {}
			}
		],
		initiatingActivityId: initiatingActivityId
	};

	return {
		activity,
		view: {
			activityId: activity.id,
			name: viewName,
			constraints
		}
	};
}

export interface MockStore extends Store<ClientState> {
	getActions(): AnyAction[];
}

export function createStoreForTest({
	appModel,
	additionalMiddlewares,
	locale,
	initialState
}: Config = {}): MockStore {
	const actions: AnyAction[] = [];

	const { store } = createApplicationSetup({
		appModel,
		locale: locale ?? US_LOCALE,
		additionalMiddlewares: [
			...(additionalMiddlewares ?? []),
			StoreFactories.createMiddleware((_, next, action) => {
				actions.push(action);
				return next(action);
			})
		],
		initialState
	});

	return Object.assign(store, {
		getActions() {
			return actions;
		}
	});
}
