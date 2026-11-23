// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Action, AnyAction } from "typescript-fsa";
import { actionCreatorFactory } from "typescript-fsa";

import { ActivityActions } from "@com.mgmtp.a12.client/client-core";

import type { Todo } from "./TodoData.js";

const actionCreator = actionCreatorFactory("TODOS");

export interface CommonPayload extends ActivityActions.ActivityActionPayload {
	readonly listId: string;
}

export const setTodos = actionCreator<SetTodosPayload>("SET");

export interface SetTodosPayload extends CommonPayload {
	readonly todos: Todo[];
}

export const addTodo = actionCreator<AddTodoPayload>("ADD");

export interface AddTodoPayload extends CommonPayload {
	readonly newTodo: string;
}

export const removeTodo = actionCreator<RemoveTodoPayload>("REMOVE");

export interface RemoveTodoPayload extends CommonPayload {
	readonly removedTodoId: string;
}

export const moveTodo = actionCreator<MoveTodoPayload>("MOVE");

export interface MoveTodoPayload extends CommonPayload {
	readonly movedTodo: Todo;
}

export function initializeTodos(payload: InitializeTodosPayload) {
	return ActivityActions.loadData(payload);
}
initializeTodos.match = (action: AnyAction): action is Action<InitializeTodosPayload> => {
	return ActivityActions.loadData.match(action) && "listIds" in action.payload;
};
export interface InitializeTodosPayload extends ActivityActions.ActivityActionPayload {
	readonly listIds: string[];
}
