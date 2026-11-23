// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { createContext } from "react";

import type { ProvidersProps } from "./LayoutProps.js";

const invalidState = new Proxy({} as ProvidersProps, {
	get() {
		throw new Error(
			"Empty LayoutProvidersContext, did you forget to wrap your application in <LayoutProvidersContext>?"
		);
	}
});

/**
 * @experimental
 * Necessary when using the appModelToDynamicConfig adapter
 */
export const LayoutProvidersContext = createContext<ProvidersProps>(invalidState);
