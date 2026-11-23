// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Middleware } from "redux";
import { isType } from "typescript-fsa";

import { StoreActions, StoreFactories } from "@com.mgmtp.a12.client/client-core";

import type { StateHistory } from "./factories.js";

export namespace StateHistoryMiddleware {
	/**
	 * A redux middleware to save the application state in a StateHistory, when an action is dispatched.
	 * It deletes the StateHistory, when the user logs out.
	 */
	export function recorder(stateHistory: StateHistory): Middleware {
		return StoreFactories.createMiddleware((api, next, action) => {
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
}
