// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";
import { isDeepStrictEqual } from "node:util";

import type { Action } from "redux-saga";

import { ActivityActions } from "../../core/activity/index.js";

import type { MockStore } from "../unit/core/frame/utils.js";

export const isCancelRequested = ActivityActions.cancelRequested.match;

function IsCancelRequested(ids: string[]): (action: Action) => boolean {
	return action =>
		ActivityActions.cancelRequested.match(action) &&
		isDeepStrictEqual(action.payload.activityIds, ids);
}

export function assertCancelRequestedAction(store: MockStore, activityIds: string[]): void {
	const actions = store.getActions().filter(IsCancelRequested(activityIds));
	strictEqual(actions.length, 1, "Expected exactly one CANCEL_REQUESTED action");
}
