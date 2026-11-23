// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Store } from "redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { ModuleRegistryProvider, FrameFactories } from "@com.mgmtp.a12.client/client-core";

import { Placeholder } from "../components/devAppContext.js";

export function createViewProvider(store: Store): View.Provider {
	return ModuleRegistryProvider.getViewProvider(store.getState(), fallbackViewProvider);

	/**
	 * Example of a custom, application wide ui component renderer. Note that it
	 * aggregates other custom renderers and as the last item also the built-in
	 * renderer.
	 */
	function fallbackViewProvider(componentName: string): View.ViewComponent {
		return FrameFactories.viewProvider(componentName) ?? Placeholder;
	}
}
