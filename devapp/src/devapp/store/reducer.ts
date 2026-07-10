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

import type { Action as ReduxAction } from "redux";
import { compose, type Reducer } from "redux";

import type { Activity, Modifier } from "@com.mgmtp.a12.client/client-core";
import { ActivityLenses, modifyIfPresent, modifyWithLens } from "@com.mgmtp.a12.client/client-core";
import type { Action } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";

import { isCounterData, setCase, triggerStoreUpdate, type SetCasePayload } from "./actions.js";

// example for old slices reducer (now obsolete)
export function counter(state = 0, action: ReduxAction): number {
	return triggerStoreUpdate.match(action) ? state + 1 : state;
}

export function SetCaseReducer(defaultReducer: Reducer<object>): Reducer<object> {
	return function (state, action) {
		return state && setCase.match(action)
			? setCaseReducer(state, action)
			: defaultReducer(state, action);
	};
}

// custom reducer to set Activity.case and increment a counter (representing
// custom logic).
function setCaseReducer(state: object, action: Action<SetCasePayload>): object {
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
	const data = isCounterData(dataHolders[0].data) ? dataHolders[0].data : { count: 0 };
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
