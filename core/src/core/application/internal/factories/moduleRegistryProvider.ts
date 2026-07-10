/*
 * SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
 *
 * Copyright (c) 2012-2026 mgm technology partners GmbH
 *
 * Dual License
 * ------------
 * This source file is part of the mgm A12 Platform and available under
 * a choice of two different licenses:
 *
 * 1. Open-Source License - EUPL v1.2
 *    You may redistribute and/or modify this file under the terms of the
 *    European Union Public License, version 1.2 - see https://eupl.eu/.
 *
 * 2. Commercial License
 *    Alternatively, you may obtain a commercial license from
 *    mgm technology partners GmbH, that permits use of this software
 *    under different terms (including support and maintenance services).
 *
 *    Please contact a12-license@mgm-tp.com for more information.
 *
 * You must select and comply with exactly one of the above license options.
 *
 * Warranty Disclaimer (applies to either option)
 * ----------------------------------------------
 * THIS SOFTWARE IS PROVIDED "AS IS" AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import type { View } from "../../../view/internal/view.js";

import type { ModuleRegistry } from "./moduleRegistry.js";
import { getModuleRegistryInstance } from "./moduleRegistryInstance.js";

/**
 * The ModuleRegistryProvider to provide the central ModuleRegistry instance
 */
export const ModuleRegistryProvider = {
	/** Return the singleton instance of the registry. */
	getInstance(): ModuleRegistry {
		return getModuleRegistryInstance();
	},

	/**
	 * Creates a view provider which provides views from the registered modules.
	 *
	 * @param state can be used to dynamically replace the provider
	 * @param fallback used in case no module returns a suitable view
	 */
	getViewProvider(state: object, fallback: View.Provider): View.Provider {
		return (componentName: string) => {
			for (const module of ModuleRegistryProvider.getInstance().getAllModules()) {
				const result = module.views ? module.views(state)(componentName) : undefined;
				if (result) {
					return result;
				}
			}
			return fallback(componentName);
		};
	}
};
