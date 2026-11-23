// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { compose, type AnyAction, type Reducer } from "redux";
import type { Action } from "typescript-fsa";

import type { Activity, Modifier } from "@com.mgmtp.a12.client/client-core";
import { ActivityLenses, modifyIfPresent, modifyWithLens } from "@com.mgmtp.a12.client/client-core";

import { DevAppActions } from "./actions.js";

// example for old slices reducer (now obsolete)
export function counter(state = 0, action: AnyAction): number {
	return DevAppActions.triggerStoreUpdate.match(action) ? state + 1 : state;
}

export function SetCaseReducer(defaultReducer: Reducer<object>): Reducer<object> {
	return function (state, action) {
		return state && DevAppActions.setCase.match(action)
			? setCaseReducer(state, action)
			: defaultReducer(state, action);
	};
}

// custom reducer to set Activity.case and increment a counter (representing
// custom logic).
function setCaseReducer(state: object, action: Action<DevAppActions.SetCasePayload>): object {
	const { activityId, caze } = action.payload;

	const toggleCase = compose(SetCase(caze), incrementCounter);
	const toggleCaseIfActivityPresent = modifyIfPresent(toggleCase);

	return modifyWithLens(ActivityLenses.activity(activityId))(toggleCaseIfActivityPresent)(state);
}

function SetCase(caze: string): Modifier<Activity> {
	return function (activity) {
		return {
			...activity,
			case: caze
		};
	};
}

const incrementCounter: Modifier<Activity> = activity => {
	const dataHolders = activity.dataHolders;
	const data = DevAppActions.isCounterData(dataHolders[0].data)
		? dataHolders[0].data
		: { count: 0 };
	return {
		...activity,
		dataHolders: [
			{
				...dataHolders[0],
				data: { count: data.count + 1 }
			}
		]
	};
};

export * as DevAppReducers from "./reducer.js";
