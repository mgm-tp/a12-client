// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { AnyAction, Store } from "redux";

import { observeStore } from "./observeStore.js";

interface Options {
	readonly timeout?: number;
}

export type WaitForFunc = (
	assertCallback: (state: unknown) => void,
	options?: Options
) => Promise<boolean>;

export function waitForWithStore(store: Store<object, AnyAction>): WaitForFunc {
	return function waitFor(assertCallback, options = {}) {
		return new Promise((resolve, reject) => {
			let lastError: unknown;
			const { timeout = 4500 } = options;
			const timer = setTimeout(onTimeout, timeout);
			const unsubscribe = observeStore({ store, onChange });

			function onDone({ result, error }: { result?: boolean; error?: unknown }): void {
				clearTimeout(timer);
				setImmediate(() => {
					unsubscribe();
				});
				if (result) {
					resolve(result);
				} else {
					reject(error);
				}
			}
			function onChange(currentState: unknown): void {
				try {
					assertCallback(currentState);
					onDone({ result: true });
				} catch (error) {
					lastError = error;
				}
			}
			function onTimeout() {
				onDone({
					error: lastError ?? new Error("Timed out in waitForElement.")
				});
			}
			onChange(store.getState());
		});
	};
}
