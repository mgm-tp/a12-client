// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging/lib/factory.js";

import type { DynamicConfiguration } from "../../../configurationNG/internal/dynamicConfiguration.js";

import type { Module } from "./module.js";

const logger = LoggerFactory.getLogger("core/application");

/**
 * The ModuleRegistry allows registration and unregistration of modules and offers a List
 * of all registered modules.
 *
 * An instance of the ModuleRegistry is provided as a singleton by the ModuleRegistryProvider.
 */
export interface ModuleRegistry {
	addModule(module: Module | DynamicConfiguration): void;
	removeModule(module: Module | DynamicConfiguration): void;
	removeModuleById(id: string): void;
	getAllModules(): ReadonlyArray<Module | DynamicConfiguration>;
}

/** @internal */
type ModuleRegistryEventType = "ADD" | "REMOVE";

/** @internal */
export interface ModuleRegistryEvent {
	readonly type: ModuleRegistryEventType;
	readonly module: Module | DynamicConfiguration;
}

/** @internal */
export interface ModuleRegistryEventListener {
	(event: ModuleRegistryEvent): void;
}

/** @internal */
export interface ModuleRegistryEventInterceptor {
	(event: ModuleRegistryEvent): boolean;
}

/**
 * @internal
 *
 * Default implementation of the {@link ModuleRegistry} interface.
 *
 * Allows the registration of event listeners to get informed when ever
 * a module is registered or unregistered.
 */
export class ModuleRegistryImpl implements ModuleRegistry {
	private modules: (Module | DynamicConfiguration)[] = [];
	private interceptor: ModuleRegistryEventInterceptor;
	private eventListenerList: ModuleRegistryEventListener[] = [];

	/**
	 * Sets an interceptor function that is called before a module is added or removed.
	 * Module Events are only executed if the interceptor returns false.
	 */
	constructor(interceptor: ModuleRegistryEventInterceptor) {
		this.interceptor = interceptor;
	}

	private callEventListener(type: ModuleRegistryEventType, module: Module): void {
		for (const eventListener of this.eventListenerList) {
			eventListener({ type: type, module: module });
		}
	}

	/**
	 * Subscribe to Module events
	 * This is used by some extensions to react on module events.
	 */
	subscribe(eventListener: ModuleRegistryEventListener): () => void {
		this.eventListenerList.push(eventListener);
		return () => {
			const index = this.eventListenerList.indexOf(eventListener);
			if (index >= 0) {
				this.eventListenerList.splice(index, 1);
			}
		};
	}

	addModule(module: Module | DynamicConfiguration): void {
		if (this.interceptor({ type: "ADD", module: module })) {
			throw new Error(`Cannot add module ${module.id} to registry.`);
		} else {
			if (this.modules.some(mod => mod.id === module.id)) {
				throw new Error(`Module ${module.id} is already registered.`);
			}

			logger.log(`Adding module ${module.id} to registry.`);
			this.modules.push(module);
			this.callEventListener("ADD", module);
		}
	}

	removeModuleById(id: string): void {
		for (const module of this.modules) {
			if (module.id === id) {
				this.removeModule(module);
			}
		}
	}

	removeModule(module: Module | DynamicConfiguration): void {
		if (this.interceptor({ type: "REMOVE", module: module })) {
			throw new Error(`Cannot remove module ${module.id} from registry.`);
		} else {
			const index = this.modules.indexOf(module);
			if (index < 0) {
				throw new Error(`Cannot find module ${module.id}.`);
			}
			logger.log(`Removing module ${module.id} from registry.`);
			this.modules.splice(index, 1);
			this.callEventListener("REMOVE", module);
		}
	}

	getAllModules(): ReadonlyArray<Module | DynamicConfiguration> {
		return this.modules;
	}
}
