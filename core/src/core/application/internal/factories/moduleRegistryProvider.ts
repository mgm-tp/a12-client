// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { View } from "../../../view/internal/view.js";

import type { ModuleRegistry } from "./moduleRegistry.js";
import { getModuleRegistryInstance } from "./moduleRegistryInstance.js";

/**
 * The ModuleRegistryProvider to provide the central ModuleRegistry instance
 */
export namespace ModuleRegistryProvider {
	/** Return the singleton instance of the registry. */
	export function getInstance(): ModuleRegistry {
		return getModuleRegistryInstance();
	}

	/**
	 * Creates a view provider which provides views from the registered modules.
	 *
	 * @param state can be used to dynamically replace the provider
	 * @param fallback used in case no module returns a suitable view
	 */
	export function getViewProvider(state: object, fallback: View.Provider): View.Provider {
		return (componentName: string) => {
			for (const module of getInstance().getAllModules()) {
				const result = module.views ? module.views(state)(componentName) : undefined;
				if (result) {
					return result;
				}
			}
			return fallback(componentName);
		};
	}
}
