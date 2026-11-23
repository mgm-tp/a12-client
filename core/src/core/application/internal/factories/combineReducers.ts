// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { AnyAction, Reducer } from "redux";

import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging/lib/factory.js";

import type { RequiredProps } from "../../../utils.js";

import type { InternalReducerMap } from "./reducerMap.js";

const logger = LoggerFactory.getLogger("core/application");

function getUndefinedStateErrorMessage(key: string, action: AnyAction): string {
	const actionType = action.type;
	const actionDescription = (actionType && `action "${String(actionType)}"`) || "an action";

	return (
		`Given ${actionDescription}, reducer "${key}" returned undefined. ` +
		`To ignore an action, you must explicitly return the previous state. ` +
		`If you want this reducer to hold no value, you can return null instead of undefined.`
	);
}

/**
 * @internal
 *
 * Re-implementation of the redux combineReducers Method for the usage with modules.
 * This is needed because the standard function is too restricted as it checks if all
 * slices that are defined by the reducer map are in the state.
 */
export function combineReducers(reducers: InternalReducerMap): Reducer {
	const reducerKeys = Object.keys(reducers);

	const finalReducers = reducerKeys.reduce((acc, key) => {
		const reducer = reducers[key];

		if (typeof reducer === "undefined") {
			logger.warn(`No reducer provided for key "${key}"`);
			return acc;
		} else {
			return { ...acc, [key]: reducer };
		}
	}, {} as RequiredProps<InternalReducerMap>);

	const finalReducerKeys = Object.keys(finalReducers);

	return function combination(state = {}, action) {
		let hasChanged = false;

		const nextState: Record<string, unknown> = {};
		for (const key of finalReducerKeys) {
			const reducer = finalReducers[key];
			const previousStateForKey = state[key];
			const nextStateForKey = reducer(previousStateForKey, action);
			if (typeof nextStateForKey === "undefined") {
				const errorMessage = getUndefinedStateErrorMessage(key, action);
				throw new Error(errorMessage);
			}
			nextState[key] = nextStateForKey;
			hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
		}
		return hasChanged ? { ...state, ...nextState } : state;
	};
}
