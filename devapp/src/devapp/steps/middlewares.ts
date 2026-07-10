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

import { isAction, type Middleware } from "redux";

import { StoreActions, StoreFactories } from "@com.mgmtp.a12.client/client-core";
import { isType } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";

import type { StateHistory } from "./factories.js";

/**
 * A redux middleware to save the application state in a StateHistory, when an action is dispatched.
 * It deletes the StateHistory, when the user logs out.
 */
export function stateHistoryRecorder(stateHistory: StateHistory): Middleware {
	return StoreFactories.createMiddleware((api, next, action) => {
		if (!isAction(action)) {
			throw new Error("Expected only actions to be dispatched!");
		}
		if (isType(action, StoreActions.resetState)) {
			stateHistory.clear();
			return next(action);
		} else {
			const entry = {
				action,
				stateBefore: api.getState(),
				stateAfter: api.getState(),
				date: new Date()
			};
			stateHistory.entries.push(entry);
			const historyLen = stateHistory.entries.length;
			const retVal = next(action);
			const furtherActionsDispatched = stateHistory.entries.length > historyLen;
			entry.stateAfter = furtherActionsDispatched
				? stateHistory.entries[historyLen].stateBefore
				: api.getState();
			return retVal;
		}
	});
}
