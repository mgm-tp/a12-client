// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Action, Dispatch, Middleware, MiddlewareAPI, Reducer, Store } from "redux";
import { compose } from "redux";
// TODO: A12C-3195, SagaIterator to SagaGenerator
// oxlint-disable-next-line no-restricted-imports
import type { EventChannel, SagaIterator, Task } from "redux-saga";
import { eventChannel } from "redux-saga";
import type { SagaGenerator } from "typed-redux-saga";
import { cancel, fork, select, take } from "typed-redux-saga";

import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging/lib/factory.js";

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
 * The ModuleExtensions namespace provides Module Extension Points to integrate
 * reducers, sagas, middleware, data providers, and models into the Client setup.
 *
 * A ModuleRegistry singleton is created and provided, the different extensions use
 * this instance to implement the module integration.
 */
export namespace ModuleExtensions {
	/**
	 * Creates a Reducer which delegates the action to all modules reducers.
	 * A modified state is handed over to the next module reducer.
	 */
	export function createModulesReducer(appReducer: Reducer): Reducer {
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
	}

	/**
	 * Creates a redux middleware which chains all module middlewares using redux compose.
	 */
	export function createModulesMiddleware(): Middleware {
		return (api: MiddlewareAPI) => {
			return (next: Dispatch) => {
				return (action: Action) => {
					const allMiddlewares: Middleware[] = [];
					for (const mod of getModuleRegistryInstance().getAllModules()) {
						if (mod.middlewares) {
							allMiddlewares.push(...mod.middlewares(api.getState()));
						}
					}
					const chain = allMiddlewares.map(middleware => middleware(api));
					return compose<Dispatch>(...chain)(next)(action);
				};
			};
		};
	}

	/**
	 * Creates a redux saga which forks sagas for each module.
	 * The saga holds a map of the module sagas and reacts on
	 * module add and remove events to fork or cancel module sagas.
	 */
	export function createModulesSaga(): () => SagaGenerator<void> {
		function* _startModule(sagas: ReadonlyArray<() => SagaIterator<void>>): SagaIterator<void> {
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
	}

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

	/**
	 * Subscribes a Listener closure to module registration events and dispatches
	 * Actions to add or remove parts of the model. Throws an Error if an active
	 * module is going to be removed
	 */
	export function createModelListener(store: Store<object>): void {
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
	}

	/**
	 * Get all DataProvider implemented in modules.
	 */
	export function getDataProviders(state: object): DataProvider[] {
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
	}

	/**
	 * Subscribes to module registration events to set the currently registered modules
	 * into redux state.
	 */
	export function createModuleListener(store: Store): void {
		const existingModules = getModuleRegistryInstance().getAllModules();

		store.dispatch(ApplicationActions.addModuleIds(existingModules.map(m => m.id)));

		getModuleRegistryInstance().subscribe(event => {
			const method: keyof typeof ApplicationActions =
				event.type === "ADD" ? "addModuleIds" : "removeModuleIds";

			store.dispatch(ApplicationActions[method]([event.module.id]));
		});
	}
}
