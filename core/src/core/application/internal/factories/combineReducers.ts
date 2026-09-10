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
