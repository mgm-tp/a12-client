// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { select, take } from "typed-redux-saga";

import type { Selector } from "./selectors.js";

export namespace StoreSagas {
	/**
	 * This saga waits for a specific state change which is specified
	 * by the `selector` function.
	 */
	export function* waitForStateChange<T>(
		selector: Selector<{ stateChanged: boolean; returnValue: T }>
	): SagaGenerator<T> {
		let selectionResult = yield* select(selector);
		if (selectionResult.stateChanged) {
			return selectionResult.returnValue;
		}

		while (true) {
			yield* take("*");
			selectionResult = yield* select(selector);
			if (selectionResult.stateChanged) {
				return selectionResult.returnValue;
			}
		}
	}

	/**
	 * Same as {@link waitForStateChange}, but returns as soon as the selector returns
	 * a "defined" value.
	 */
	export function* waitFor<T>(selector: WaitForSelector<T>): SagaGenerator<T> {
		do {
			const selectionResult = yield* select(selector);
			if (selectionResult) {
				return selectionResult;
			}
			yield* take("*");
		} while (true);
	}

	export type WaitForSelector<T> = Selector<T | undefined>;
}
