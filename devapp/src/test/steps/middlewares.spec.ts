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

import { strictEqual } from "node:assert/strict";

import type { MiddlewareAPI } from "redux";
import type { Action } from "typescript-fsa";

import type { StateHistory } from "../../devapp/steps/factories.js";
import { StateHistoryFactory } from "../../devapp/steps/factories.js";
import { StateHistoryMiddleware } from "../../devapp/steps/middlewares.js";

describe("steps.middlewares", () => {
	describe("recorder", () => {
		describe("Given a StateHistory object", () => {
			describe("can be applied as redux middleware, which", () => {
				const emptyAction: Action<{}> = { type: "EmptyAction", payload: {} };

				const entry: StateHistory.Entry = {
					action: emptyAction,
					stateBefore: {},
					stateAfter: {},
					date: new Date()
				};

				describe("on receiving an action other than AuthenticationActions.userLoggingOut", () => {
					it("adds a new entry to the StateHistory containing the state before and after the action", () => {
						const stateHistory = StateHistoryFactory.createStateHistory([entry]);

						const recorderMiddleware = StateHistoryMiddleware.recorder(stateHistory);

						const mockApi = { getState: () => {}, dispatch: () => {} } as MiddlewareAPI;

						recorderMiddleware(mockApi)(mockApi.dispatch)(emptyAction);

						strictEqual(stateHistory.entries.length, 2);
					});
				});
			});
		});
	});
});
