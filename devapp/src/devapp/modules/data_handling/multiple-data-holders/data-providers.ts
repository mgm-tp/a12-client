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

import type { SagaGenerator } from "typed-redux-saga";
import { delay, put } from "typed-redux-saga";

import type { Activity, DataProvider } from "@com.mgmtp.a12.client/client-core";
import { NotificationActions } from "@com.mgmtp.a12.client/client-core";

import { setTodos } from "./actions.js";
import { isExampleDescriptor } from "./descriptor.js";
import type { TodoData } from "./TodoData.js";

const INITIAL_TODOS_A = [
	{ name: "Todo for A", id: "a1" },
	{ name: "Another todo for A", id: "a2" },
	{ name: "Yet another todo for A", id: "a3" }
];
const INITIAL_TODOS_B = [
	{ name: "Todo for B", id: "b1" },
	{ name: "Another todo for B", id: "b2" },
	{ name: "Yet another todo for B", id: "b3" }
];

export const TodosProviderListA: DataProvider = {
	name: "DataProviderListA",
	canHandle({ dataHolder: { descriptor }, operation }) {
		return operation === "load" && isExampleDescriptor(descriptor) && descriptor.listId === "A";
	},
	*provideData({ activityId, dataHolders, operation }): SagaGenerator<void> {
		const dataHolder = dataHolders.find(dh => dh.descriptor.listId === "A");
		if (dataHolder === undefined) {
			throw new Error("Could not find data holder for List A.");
		}

		if (operation === "load") {
			yield* delay(2000);

			yield* put(
				setTodos({
					activityId,
					listId: dataHolder.descriptor.listId as string,
					todos: INITIAL_TODOS_A
				})
			);
		}
	}
};

export const TodosProviderListB: DataProvider = {
	name: "DataProviderListB",
	canHandle({ dataHolder: { descriptor }, operation }) {
		return operation === "load" && isExampleDescriptor(descriptor) && descriptor.listId === "B";
	},
	*provideData({ activityId, dataHolders, operation }): SagaGenerator<void> {
		const dataHolder = dataHolders.find(dh => dh.descriptor.listId === "B");
		if (dataHolder === undefined) {
			throw new Error("Could not find data holder for List B.");
		}

		if (operation === "load") {
			yield* delay(4000);

			yield* put(
				setTodos({
					activityId,
					listId: dataHolder.descriptor.listId as string,
					todos: INITIAL_TODOS_B
				})
			);
		}
	}
};

export const SaveTodosProvider: DataProvider = {
	name: "SaveTodosProvider",
	canHandle({ dataHolder: { descriptor }, operation }) {
		return (
			operation === "save" &&
			isExampleDescriptor(descriptor) &&
			typeof descriptor.listId === "string"
		);
	},
	*provideData({ dataHolders, details }: DataProvider.SaveConfig): SagaGenerator<void> {
		const dataToSave = dataHolders.filter(
			dh => dh.savingState === "saving"
		) as Activity.DataHolder<TodoData>[];

		if (dataToSave.length) {
			yield* delay(2000);
			yield* put(details.saving.done({}));

			yield* put(
				NotificationActions.add({
					message: {
						key: "examples.data-handling.multiple-data-holders.saved",
						args: {
							data: {
								type: "plain",
								value: dataToSave.map(dh => JSON.stringify(dh.data?.todos ?? [])).join("\n")
							}
						}
					},
					duration: 5000
				})
			);
		}
	}
};
