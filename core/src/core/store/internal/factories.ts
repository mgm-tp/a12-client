// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { AnyAction, Dispatch, Middleware, MiddlewareAPI } from "redux";

export namespace StoreFactories {
	/**
	 * convenience factory function for creating middlewares
	 *
	 * @param func A function, which encapsulates middleware logic.
	 * @returns A redux middleware, which executes the given function.
	 */
	export function createMiddleware(
		func: (
			api: MiddlewareAPI,
			next: Dispatch,
			action: AnyAction // TODO: This should be Action<unknown>
		) => AnyAction
	): Middleware {
		return api => next => action => func(api, next, action);
	}
}
