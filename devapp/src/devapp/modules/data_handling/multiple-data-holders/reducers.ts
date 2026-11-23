// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Action } from "typescript-fsa";

import type { Activity, ActivityReducers } from "@com.mgmtp.a12.client/client-core";

import type {
	AddTodoPayload,
	InitializeTodosPayload,
	MoveTodoPayload,
	RemoveTodoPayload,
	SetTodosPayload
} from "./actions.js";
import { addTodo, initializeTodos, moveTodo, removeTodo, setTodos } from "./actions.js";
import { isTodoDataHolder } from "./TodoData.js";

let todoIdCounter = 0;

function handleAddTodo(
	action: Action<AddTodoPayload>
): (dh: Activity.DataHolder) => Activity.DataHolder {
	return dh => {
		return isTodoDataHolder(dh) && dh.descriptor.listId === action.payload.listId
			? {
					...dh,
					data: {
						todos: [
							...(dh.data?.todos ?? []),
							{ name: action.payload.newTodo, id: `${todoIdCounter++}` }
						]
					},
					loadingState: "loaded",
					dirty: true
				}
			: dh;
	};
}

function handleSetTodos(
	action: Action<SetTodosPayload>
): (dh: Activity.DataHolder) => Activity.DataHolder {
	return dh => {
		return isTodoDataHolder(dh) && dh.descriptor.listId === action.payload.listId
			? {
					...dh,
					data: {
						todos: action.payload.todos
					},
					loadingState: "loaded",
					busy: false,
					dirty: false
				}
			: dh;
	};
}

/**
 * `listId` is only checked for existence here. Therefore,
 * this reducer handles the `moveTodo` action twice:
 * - if the action originated from the dh, the todo is removed
 * - if not, the todo will be added
 */
function handleMoveTodo(
	action: Action<MoveTodoPayload>
): (dh: Activity.DataHolder) => Activity.DataHolder {
	return dh => {
		return isTodoDataHolder(dh) && dh.descriptor.listId !== undefined
			? {
					...dh,
					data: {
						todos:
							action.payload.listId === dh.descriptor.listId
								? dh.data?.todos.filter(todo => todo.id !== action.payload.movedTodo.id)
								: [
										...(dh.data?.todos ?? []),
										{ name: action.payload.movedTodo.name, id: `${todoIdCounter++}` }
									]
					},
					loadingState: "loaded",
					dirty: true
				}
			: dh;
	};
}

function handleRemoveTodo(
	action: Action<RemoveTodoPayload>
): (dh: Activity.DataHolder) => Activity.DataHolder {
	return dh => {
		return isTodoDataHolder(dh) && dh.descriptor.listId === action.payload.listId
			? {
					...dh,
					data: {
						todos: dh.data?.todos.filter(todo => todo.id !== action.payload.removedTodoId)
					},
					dirty: true
				}
			: dh;
	};
}

function handleInitializeTodoDHs(
	dhs: Activity.DataHolder[] | undefined,
	action: Action<InitializeTodosPayload>
): Activity.DataHolder[] {
	return [
		...(dhs ?? []),
		...action.payload.listIds.map(listId => ({
			descriptor: { listId, feature: "MultipleDataHolders" },
			data: {},
			loadingState: "loading" as const,
			busy: true,
			dirty: false,
			savingState: "not_saved" as const,
			slices: {}
		}))
	];
}

export const dataReducers: ActivityReducers.DataReducer[] = [
	{
		reduce(dataHolders, action) {
			return addTodo.match(action) ? dataHolders.map(handleAddTodo(action)) : dataHolders;
		}
	},
	{
		reduce(dataHolders, action) {
			return setTodos.match(action) ? dataHolders.map(handleSetTodos(action)) : dataHolders;
		}
	},
	{
		reduce(dataHolders, action) {
			return moveTodo.match(action) ? dataHolders.map(handleMoveTodo(action)) : dataHolders;
		}
	},
	{
		reduce(dataHolders, action) {
			return removeTodo.match(action) ? dataHolders.map(handleRemoveTodo(action)) : dataHolders;
		}
	},
	{
		reduce(dataHolders, action) {
			return initializeTodos.match(action)
				? handleInitializeTodoDHs(dataHolders, action)
				: dataHolders;
		}
	}
];
