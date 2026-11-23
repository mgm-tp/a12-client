// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { put, takeEvery } from "typed-redux-saga";
import type { ActionCreator } from "typescript-fsa";

import { ApplicationActions } from "../actions.js";

interface Configuration {
	// oxlint-disable-next-line typescript/no-explicit-any
	readonly start: ActionCreator<any>[];
	// oxlint-disable-next-line typescript/no-explicit-any
	readonly end: ActionCreator<any>[];
}

/** @internal */
export function configureApplicationBusySaga({
	start: busyTriggers,
	end: notBusyTriggers
}: Configuration): (() => SagaGenerator<void>)[] {
	return [
		function* (): SagaGenerator<void> {
			yield* takeEvery(busyTriggers, function* () {
				yield* put(ApplicationActions.setBusy(true));
			});
		},
		function* (): SagaGenerator<void> {
			yield* takeEvery(notBusyTriggers, function* () {
				yield* put(ApplicationActions.setBusy(false));
			});
		}
	];
}
