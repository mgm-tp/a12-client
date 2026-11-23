// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

// tag::content[]
import type { ComposeEnhancer } from "@com.mgmtp.a12.client/client-core";

declare let window: Window & {
	__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: ComposeEnhancer;
};

/**
 * Trick to enable Redux DevTools with TS: see https://www.npmjs.com/package/redux-ts
 */
export function enableReduxDevTools(): ComposeEnhancer | undefined {
	return typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ !== undefined
		? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
		: undefined;
}
// end::content[]
