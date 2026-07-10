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

import type { Middleware, Reducer, Store } from "redux";
import { compose } from "redux";
import type { EventChannel, Task } from "redux-saga";
import { eventChannel } from "redux-saga";
import type { SagaGenerator } from "typed-redux-saga";
import { cancel, fork, select, take } from "typed-redux-saga";

import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging";

import type { DataEditor } from "../../../data/internal/DataEditor.js";
import type { DataProvider } from "../../../data/internal/DataProvider.js";
import { ModelActions } from "../../../model/internal/actions.js";
import type { ApplicationModel } from "../../../model/internal/ApplicationModel.js";

import { ApplicationActions } from "../actions.js";
import { createDataProviderForDataEditors } from "../adapter/createDataProviderForDataEditors.js";

import { combineReducers } from "./combineReducers.js";
import type { ModuleRegistryEvent } from "./moduleRegistry.js";
import { getModuleRegistryInstance } from "./moduleRegistryInstance.js";
import type { InternalReducerMap } from "./reducerMap.js";

const logger = LoggerFactory.getLogger("core/application");

/**
 * @internal
 * @ignore
 *
 * Provides Module Extension Points to integrate
 * reducers, sagas, middleware, data providers, and models into the Client setup.
 *
 * A ModuleRegistry singleton is created and provided, the different extensions use
 * this instance to implement the module integration.
 */
export const ModuleExtensions = {
	/**
	 * Creates a Reducer which delegates the action to all modules reducers.
	 * A modified state is handed over to the next module reducer.
	 */
	createModulesReducer(appReducer: Reducer): Reducer {
		const modulesReducer: Reducer = (state, action) => {
			const modules = getModuleRegistryInstance().getAllModules();

			const modulesReducerMap = modules.reduce((reducerMap, mod) => {
				const moduleMap = mod.reducersMap?.(state) ?? {};
				if (Object.keys(moduleMap).some(key => reducerMap[key] !== undefined)) {
					throw Error(`Module ${mod.id} defines state slices that already exist.`);
				}

				return {
					...reducerMap,
					...moduleMap
				};
			}, {} as InternalReducerMap);

			// We need a custom combineReducers function because we have to combine the resulting reducer
			// with the appReducer. The appreducer is needed to stay compatible in createApplicationSetup
			return combineReducers(modulesReducerMap)(state, action);
		};

		return (state, action) => appReducer(modulesReducer(state, action), action);
	},

	/**
	 * Creates a redux middleware which chains all module middlewares using redux compose.
	 */
	createModulesMiddleware(): Middleware {
		return api => {
			return next => {
				return action => {
					const allMiddlewares: Middleware[] = [];
					for (const mod of getModuleRegistryInstance().getAllModules()) {
						if (mod.middlewares) {
							allMiddlewares.push(...mod.middlewares(api.getState()));
						}
					}
					const chain = allMiddlewares.map(middleware => middleware(api));
					return compose<(action: unknown) => unknown>(...chain)(next)(action);
				};
			};
		};
	},

	/**
	 * Creates a redux saga which forks sagas for each module.
	 * The saga holds a map of the module sagas and reacts on
	 * module add and remove events to fork or cancel module sagas.
	 */
	createModulesSaga(): () => SagaGenerator<void> {
		function* _startModule(sagas: ReadonlyArray<() => SagaGenerator<void>>): SagaGenerator<void> {
			for (const saga of sagas) {
				yield* fork(saga);
			}
		}

		return function* modulesSaga(): SagaGenerator<void> {
			let moduleSagas: { readonly [id: string]: Task | undefined } = {};
			const store = yield* select();
			for (const mod of getModuleRegistryInstance().getAllModules()) {
				if (mod.sagas) {
					moduleSagas = {
						...moduleSagas,
						[mod.id]: yield* fork(_startModule, mod.sagas(store))
					};
				}
			}

			const channel: EventChannel<ModuleRegistryEvent> = eventChannel(emitter => {
				return getModuleRegistryInstance().subscribe(emitter);
			});

			while (true) {
				const { type, module } = yield* take(channel);
				if (type === "REMOVE" && moduleSagas[module.id]) {
					const { [module.id]: task, ...remaining } = moduleSagas;
					if (task) {
						yield* cancel(task);
					}
					moduleSagas = remaining;
				} else if (type === "ADD" && module.sagas) {
					moduleSagas = {
						...moduleSagas,
						[module.id]: yield* fork(_startModule, module.sagas(store))
					};
				}
			}
		};
	},

	/**
	 * Subscribes a Listener closure to module registration events and dispatches
	 * Actions to add or remove parts of the model. Throws an Error if an active
	 * module is going to be removed
	 */
	createModelListener(store: Store<object>): void {
		const modulesAppModels = getApplicationModels(store.getState());
		if (modulesAppModels.length > 0) {
			logger.log(
				`Adding ${modulesAppModels.length} already pre-defined modules to application model.`
			);
			store.dispatch(ModelActions.addModulesApplicationModels({ models: modulesAppModels }));
		}
		getModuleRegistryInstance().subscribe(event => {
			if (event.type === "REMOVE" && event.module.model) {
				store.dispatch(
					ModelActions.removeModuleApplicationModels({
						model: event.module.model(store)
					})
				);
			} else if (event.type === "ADD" && event.module.model) {
				store.dispatch(
					ModelActions.addModulesApplicationModels({
						models: [event.module.model(store)]
					})
				);
			}
		});
	},

	/**
	 * Get all DataProvider implemented in modules.
	 */
	getDataProviders(state: object): DataProvider[] {
		const dataProviders: DataProvider[] = [];
		const dataEditors: DataEditor[] = [];
		const modules = getModuleRegistryInstance().getAllModules();

		for (const mod of modules) {
			if (mod.dataProviders !== undefined) {
				dataProviders.push(...mod.dataProviders(state));
			}
			if (mod.dataEditors !== undefined) {
				dataEditors.push(...mod.dataEditors);
			}
		}

		const moduleDataProvider = createDataProviderForDataEditors(dataEditors);

		dataProviders.push(moduleDataProvider);

		return dataProviders;
	},

	/**
	 * Subscribes to module registration events to set the currently registered modules
	 * into redux state.
	 */
	createModuleListener(store: Store): void {
		const existingModules = getModuleRegistryInstance().getAllModules();

		store.dispatch(ApplicationActions.addModuleIds(existingModules.map(m => m.id)));

		getModuleRegistryInstance().subscribe(event => {
			const method: keyof typeof ApplicationActions =
				event.type === "ADD" ? "addModuleIds" : "removeModuleIds";

			store.dispatch(ApplicationActions[method]([event.module.id]));
		});
	}
};

/**
 * Helper function to concat the models of all modules
 */
function getApplicationModels(state: object): ApplicationModel[] {
	const models: ApplicationModel[] = [];
	for (const mod of getModuleRegistryInstance().getAllModules()) {
		if (mod.model) {
			models.push(mod.model(state));
		}
	}
	return models;
}
