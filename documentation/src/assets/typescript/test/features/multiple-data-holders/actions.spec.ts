// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

// tag::content[]

import { deepStrictEqual } from "node:assert/strict";

import type { Action } from "typescript-fsa";

import type { AddTodoPayload } from "./action.js";
import { addTodoRequested } from "./action.js";

describe("@com.mgmtp.a12.client.devapp.features.multiple-data-holders", () => {
	describe("ActionCreators", () => {
		describe(
			"When the ActionCreator addTodoRequested is called with " +
				"an activity id list id and a new todo string",
			() => {
				it("creates an action of this type with the given ids and a todo as payload", () => {
					const payload: AddTodoPayload = {
						activityId: "1",
						listId: "A",
						newTodo: "New todo"
					};
					const expectedAction: Action<AddTodoPayload> = {
						type: addTodoRequested.type,
						payload
					};
					deepStrictEqual(addTodoRequested(payload), expectedAction);
				});
			}
		);
	});
});
// end::content[]
