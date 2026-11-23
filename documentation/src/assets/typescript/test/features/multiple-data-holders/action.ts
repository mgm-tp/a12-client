// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { actionCreatorFactory } from "typescript-fsa";

import type { ActivityActions } from "@com.mgmtp.a12.client/client-core";

export interface CommonPayload extends ActivityActions.ActivityActionPayload {
	readonly listId: string;
}

export interface AddTodoPayload extends CommonPayload {
	readonly newTodo: string;
}

export const addTodoRequested = actionCreatorFactory("TODO")<AddTodoPayload>("ADD");
