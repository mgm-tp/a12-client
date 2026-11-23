// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Activity } from "@com.mgmtp.a12.client/client-core";

import { isExampleDescriptor } from "./descriptor.js";

export interface Todo {
	readonly name: string;
	readonly id: string;
}

export interface TodoData {
	readonly todos: Todo[];
}

export type TodoDataHolder = Activity.DataHolder<TodoData>;

export function isTodoDataHolder(dh: Activity.DataHolder): dh is TodoDataHolder {
	return isExampleDescriptor(dh.descriptor);
}
