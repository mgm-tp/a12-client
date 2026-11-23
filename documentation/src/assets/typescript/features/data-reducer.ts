// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { actionCreatorFactory } from "typescript-fsa";

import type {
	Activity,
	ActivityActions,
	ActivityReducers
} from "@com.mgmtp.a12.client/client-core";

// tag::dataReducerAPI[]
const actionCreator = actionCreatorFactory("Example");

/** Example action to add a new Todo item to the list of ToDos */
export const addTodo = actionCreator<AddTodoPayload>("ADD_TODO");

/** The payload of the addTodo action. */
export interface AddTodoPayload extends ActivityActions.ActivityActionPayload {
	readonly todo: string;
}

/** Todo list data structure to manage in a DataHolder */
export interface TodoList {
	readonly todos: string[];
}

/** Helper function to assert the type of a DataHolder */
export function isTodoDataHolder(dh: Activity.DataHolder): dh is Activity.DataHolder<TodoList> {
	return dh.descriptor.use === "todo-list";
}

export const AddTodoDataReducer: ActivityReducers.DataReducer = {
	reduce(dataHolders, action, defaultDataHolder) {
		return addTodo.match(action)
			? dataHolders.map(dh => {
					return isTodoDataHolder(dh)
						? {
								...dh,
								data: {
									...dh.data,
									todos: [...(dh.data?.todos ?? []), action.payload.todo]
								}
							}
						: dh;
				})
			: dataHolders;
	}
};
// end::dataReducerAPI[]
