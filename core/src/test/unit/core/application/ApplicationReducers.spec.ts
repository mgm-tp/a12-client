// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual, strictEqual } from "node:assert/strict";

import type { Action } from "typescript-fsa";

import { ApplicationActions, ApplicationReducers } from "../../../../core/application/index.js";

describe("core.application", () => {
	describe("ApplicationReducers", () => {
		const initialApplication = { busy: false };
		const emptyAction: Action<{}> = { type: "EmptyAction", payload: {} };

		describe("application", () => {
			describe("Given a state", () => {
				describe("Given an action whose type will not be handled by any reducer", () => {
					it("handles empty action by returning previous application state", () => {
						strictEqual(
							ApplicationReducers.application(initialApplication, emptyAction),
							initialApplication
						);
					});

					it("handles setBusy action", () => {
						deepStrictEqual(
							ApplicationReducers.application(initialApplication, ApplicationActions.setBusy(true)),
							{ ...initialApplication, busy: true }
						);
						deepStrictEqual(
							ApplicationReducers.application(
								initialApplication,
								ApplicationActions.setBusy(false)
							),
							{ ...initialApplication, busy: false }
						);
					});

					it("returns the previous application state if no update is needed", () => {
						const firstUpdate = ApplicationReducers.application(
							initialApplication,
							ApplicationActions.setBusy(true)
						);
						const secondUpdate = ApplicationReducers.application(
							firstUpdate,
							ApplicationActions.setBusy(true)
						);

						strictEqual(firstUpdate, secondUpdate, "Expected that there is no state update");
					});
				});
			});
		});
	});
});
