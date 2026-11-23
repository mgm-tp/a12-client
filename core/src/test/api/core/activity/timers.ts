// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { mock } from "node:test";

export interface MockTimerSetup {
	withTimeFreeze<F extends (...args: never[]) => ReturnType<F>>(
		f: F
	): (...args: Parameters<F>) => ReturnType<F>;
	now(offsetInMilliseconds?: number): number;
}

export function setupMockTimer(): MockTimerSetup {
	const time = 1527237182662;

	function now(offsetInMilliseconds = 0): number {
		return time + offsetInMilliseconds;
	}

	function withTimeFreeze<F extends (...args: never[]) => ReturnType<F>>(
		f: F
	): (...args: Parameters<F>) => ReturnType<F> {
		return (...args: Parameters<F>) => {
			try {
				mock.timers.enable({ apis: ["Date"], now: time });
				return f(...args);
			} finally {
				// always reset the timer before returning/throwing
				mock.timers.reset();
			}
		};
	}

	return {
		now,
		withTimeFreeze
	};
}
