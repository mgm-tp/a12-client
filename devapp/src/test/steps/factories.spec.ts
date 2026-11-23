// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual } from "node:assert/strict";

import type { Action } from "typescript-fsa";

import type { StateHistory } from "../../devapp/steps/factories.js";
import { StateHistoryFactory } from "../../devapp/steps/factories.js";

describe("steps.factories", () => {
	describe("createStateHistory", () => {
		describe("Given an array of StateHistory.Entry objects", () => {
			it("returns a StateHistory containing exactly these entries", () => {
				const emptyAction: Action<{}> = { type: "EmptyAction", payload: {} };

				const entry: StateHistory.Entry = {
					action: emptyAction,
					stateBefore: {},
					stateAfter: {},
					date: new Date()
				};
				deepStrictEqual(StateHistoryFactory.createStateHistory([entry]).entries, [entry]);
			});
		});

		describe("Not given any parameter", () => {
			it("returns an empty StateHistory", () => {
				deepStrictEqual(StateHistoryFactory.createStateHistory().entries, []);
			});
		});
	});
});
