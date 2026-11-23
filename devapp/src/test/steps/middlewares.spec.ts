// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
