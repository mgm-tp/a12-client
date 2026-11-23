// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Module, ModuleRegistry, View } from "@com.mgmtp.a12.client/client-core";
// tag::moduleRegistryProvider1[]
export namespace ModuleRegistryProvider {
	export function getInstance(): ModuleRegistry {
		// ...

		// end::moduleRegistryProvider1[]
		return DummyModuleRegistry;
		// tag::moduleRegistryProvider2[]
	}

	export function getViewProvider(state: object, fallback: View.Provider): View.Provider {
		// ...

		// end::moduleRegistryProvider2[]
		return (componentName: string) => {
			return fallback(componentName);
		};
		// tag::moduleRegistryProvider3[]
	}
}
// end::moduleRegistryProvider3[]

const DummyModuleRegistry: ModuleRegistry = {
	addModule(module: Module): void {},
	removeModule(module: Module): void {},
	removeModuleById(id: string): void {},
	getAllModules(): ReadonlyArray<Module> {
		return [];
	}
};
