// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { put, takeEvery } from "typed-redux-saga";
import type { ActionCreator } from "typescript-fsa";

import { StoreActions } from "../../../store/index.js";

/** @internal */
// oxlint-disable-next-line typescript/no-explicit-any
export function* applicationReset(trigger: ActionCreator<any>[]): SagaGenerator<void> {
	yield* takeEvery(trigger, handleApplicationReset);
}

function* handleApplicationReset(): SagaGenerator<void> {
	yield* put(StoreActions.resetState());
}
