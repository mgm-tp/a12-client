// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
