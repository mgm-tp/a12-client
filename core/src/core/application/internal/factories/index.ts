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

import { identity } from "fp-ts/lib/function.js";
import type { AnyAction, Middleware, Reducer, Store, StoreEnhancer } from "redux";
import { applyMiddleware, createStore as createReduxStore } from "redux";
// TODO: A12C-3195, SagaIterator to SagaGenerator
// eslint-disable-next-line no-restricted-imports
import type { SagaIterator, SagaMiddleware } from "redux-saga";
import createSagaMiddleware from "redux-saga";
import type { ActionCreator } from "typescript-fsa";

import type { Locale } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/Locale.js";

import { ActivityReducers } from "../../../activity/internal/reducers/index.js";
import type { DataHandler, DataLoader, DataProvider } from "../../../data/index.js";
import { isDataEditor, isDataLoader, isDataProvider } from "../../../data/index.js";
import { LocaleReducers } from "../../../locale/index.js";
import {
	getLocaleFromStorage,
	languagePersistingMiddleware
} from "../../../locale/internal/localeHandling.js";
import type { ApplicationModel } from "../../../model/internal/ApplicationModel.js";
import type { ModelLoader } from "../../../model/internal/ModelLoader.js";
import { InternalModelSagaFactory } from "../../../model/internal/ModelLoader.js";
import { modelsInSceneProviderMiddleware } from "../../../model/internal/modelsInSceneProviderMiddleware.js";
import { ModelReducers } from "../../../model/internal/reducers.js";
import { NotificationMiddlewares, NotificationReducers } from "../../../notification/index.js";
import { StoreActions, StoreMiddlewares } from "../../../store/index.js";

import { createDataProviderForDataEditors } from "../adapter/createDataProviderForDataEditors.js";
import { createDataProviderForDataLoader } from "../adapter/createDataProviderForDataLoader.js";
import { ApplicationReducers } from "../reducers.js";
import type { ApplicationSaga } from "../sagas/ApplicationSaga.js";
import { configureApplicationBusySaga } from "../sagas/busy.js";
import SagasDispatch from "../sagas/dispatch.js";
import createSagas from "../sagas/index.js";
import { applicationReset } from "../sagas/reset.js";
import { applicationResetRequested } from "../sagas/resetRequested.js";

import { combineReducers } from "./combineReducers.js";
import { ModuleExtensions } from "./moduleExtensions.js";
import { initializeInterceptor } from "./moduleRegistryInstance.js";
import { ModuleRegistryProvider } from "./moduleRegistryProvider.js";
import type { ReducerMap } from "./reducerMap.js";

/**
 * The configuration object used to setup the application
 */
export interface ApplicationSetup {
	/**
	 * The Redux store of the application
	 */
	readonly store: Store<object>;
}

export type ComposeEnhancer = (...enhancer: StoreEnhancer[]) => StoreEnhancer;

export namespace ApplicationFactories {
	export interface Config {
		/**
		 * The application's ApplicationModel
		 */
		model: ApplicationModel;

		/**
		 * The application's ModelLoader
		 */
		modelLoader: ModelLoader;

		/**
		 * The application's DataHandlers which should react to dispatched
		 * actions and execute the first matching handler out of the collection
		 * of base handlers optionally enriched by the handlers given with the
		 * overridePlatformSagas argument.
		 */
		dataHandlers?: DataHandler[];

		/**
		 * An optional list of application specific handlers defined by a
		 * {@link ApplicationSaga.Descriptor}, which can be dispatched by the
		 * application's dispatcher saga.
		 */
		overridePlatformSagas?: ApplicationSaga.Descriptor[];

		/**
		 * An optional list of application specific middlewares
		 */
		additionalMiddlewares?: Middleware[];

		/**
		 * An optional list of application specific sagas
		 */
		customSagas?: (() => SagaIterator<void>)[];

		/**
		 * An optional application specific dispatcher saga overriding the
		 * default.
		 *
		 * @param descriptors List of application saga descriptors to be
		 * considered for handling an incoming action
		 */
		dispatchSaga?(descriptors: ApplicationSaga.Descriptor[]): SagaIterator<void>;

		/**
		 * A set of actions which are executed after the store got initialized.
		 *
		 * The state after the execution of this actions is restored whenever
		 * the action StoreActions.resetState is dispatched.
		 *
		 * Keep in mind that also authentication state will be restored.
		 * Therefore, this is not suitable for user recovery!
		 */
		setupActions?: AnyAction[];

		/**
		 * When set to false, computations of a new document will not be
		 * executed when the document is created.
		 *
		 * Otherwise, computations will be executed and the updated document
		 * will be put back in the store.
		 */
		preComputeNewDocuments?: boolean;

		/**
		 * A redux store enhancer which will be composed with other enhancers
		 * required by the Client framework.
		 */
		composeEnhancer?: ComposeEnhancer;

		/**
		 * Map of additional reducers for your application
		 */
		readonly reducerMap?: ReducerMap;

		/**
		 * Reducers to modify data of specific data holders
		 */
		readonly dataReducers?: ActivityReducers.DataReducer[];

		/**
		 * An alternative root reducer factory that is used instead of the built-in one.
		 *
		 * The factory gets the default Client root reducer, that includes {@link reducerMap} and
		 * {@link dataReducers}.
		 */
		readonly rootReducer?: (defaultReducer: Reducer<object>) => Reducer<object>;

		/**
		 * The default locale that is used for initializing the store
		 */
		readonly locale?: Locale;

		/** A set of triggers to set the application busy and non-busy */
		readonly applicationBusyTriggers?: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			readonly start: ActionCreator<any>[];
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			readonly end: ActionCreator<any>[];
		};

		/** A set of triggers to reset the application state */
		readonly applicationResetTriggers?: {
			/** Set of action which request a resetting of the store */
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			readonly resetRequested: ActionCreator<any>[];

			/**
			 * Action which should be dispatched
			 * if the preconditions of the reset are fulfilled -
			 * e.g. all open activities were cancelled
			 */
			readonly resetConfirmed: AnyAction;

			/** Action which triggers the final reset of the store */
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			readonly reset: ActionCreator<any>[];
		};

		/**
		 * An optional redux-saga sagaMiddleware replacing the
		 * default one.
		 *
		 * It can be created with various options by using the
		 * createSagaMiddleware factory function from redux-saga.
		 *
		 * See redux-saga's SagaMiddlewareOptions interface for the available
		 * options.
		 *
		 * If not provided, a default sagaMiddleware without options is used.
		 */
		readonly customSagaMiddleware?: SagaMiddleware;
	}

	/**
	 * A factory function for conveniently creating the {@link ApplicationSetup}.
	 *
	 * @param config An object of type {@link ApplicationFactories.Config} to
	 * configure the application setup.
	 */
	export function createApplicationSetup({
		model,
		modelLoader,
		dataHandlers = [],
		overridePlatformSagas = [],
		additionalMiddlewares = [],
		customSagas = [],
		dispatchSaga = SagasDispatch,
		setupActions = [],
		preComputeNewDocuments,
		composeEnhancer,
		reducerMap,
		dataReducers,
		rootReducer,
		locale,
		applicationBusyTriggers,
		applicationResetTriggers,
		customSagaMiddleware
	}: Config): ApplicationSetup {
		// @ts-expect-error https://github.com/redux-saga/redux-saga/issues/2705
		const sagaMiddleware = customSagaMiddleware ?? createSagaMiddleware();

		/*
		 * Note: the order of middlewares must be chosen deliberately!
		 *
		 * The current order of 1. application-specific middlewares (from
		 * "global" additional middlewares or modules) and 2. built-in
		 * middlewares provides the former with the option to NOT pass actions
		 * to the built-in middlewares since they allowed to handle them first.
		 */
		const middlewares = [
			...additionalMiddlewares,
			modelsInSceneProviderMiddleware,
			ModuleExtensions.createModulesMiddleware(),
			languagePersistingMiddleware,
			StoreMiddlewares.logging(),
			...NotificationMiddlewares,
			sagaMiddleware
		];

		let initialState = createInitialState(model, locale);
		function initialStateProvider(): object {
			return {
				...initialState,
				locale: getLocaleFromStorage(locale)
			};
		}

		const reducerChain = rootReducer ?? identity;
		const reducer = reducerChain(createRootReducer(reducerMap, dataReducers));
		const store = createStore(reducer, middlewares, initialStateProvider, composeEnhancer);

		initializeInterceptor(store);

		const dataEditors = dataHandlers.filter(isDataEditor);

		const allDataEditorsAdapter = createDataProviderForDataEditors(dataEditors);

		const dataProvidersToUse = [
			allDataEditorsAdapter,
			...dataHandlers
				.filter(
					(handler): handler is DataLoader | DataProvider =>
						isDataLoader(handler) || isDataProvider(handler)
				)
				.map(handler =>
					isDataLoader(handler) ? createDataProviderForDataLoader(handler) : handler
				)
		];

		ModuleExtensions.createModelListener(store);
		ModuleExtensions.createModuleListener(store);

		// then run the saga
		sagaMiddleware.run(dispatchSaga, [
			...overridePlatformSagas,
			...createSagas({
				dataHandlers: dataProvidersToUse,
				preComputeNewDocuments
			})
		]);

		sagaMiddleware.run(InternalModelSagaFactory.createModelLoadingSaga(modelLoader));
		sagaMiddleware.run(ModuleExtensions.createModulesSaga());

		if (applicationBusyTriggers) {
			configureApplicationBusySaga(applicationBusyTriggers).forEach(saga =>
				sagaMiddleware.run(saga)
			);
		}
		if (applicationResetTriggers) {
			sagaMiddleware.run(() =>
				applicationResetRequested(
					applicationResetTriggers.resetRequested,
					applicationResetTriggers.resetConfirmed
				)
			);
			sagaMiddleware.run(() => applicationReset(applicationResetTriggers.reset));
		}
		customSagas.forEach(customSaga => {
			sagaMiddleware.run(customSaga);
		});
		setupActions.forEach(action => {
			store.dispatch(action);
		});

		// set a new initial state to be used by the initialStateProvider after all setupActions have run
		initialState = store.getState();

		return { store };
	}
}

function createStore(
	rootReducer: Reducer,
	middlewares: Middleware[],
	initialStateProvider: () => object,
	composeEnhancer?: ComposeEnhancer
): Store<object> {
	const reducer: Reducer = function extendedRootReducer(state, action) {
		return StoreActions.resetState.match(action)
			? initialStateProvider()
			: rootReducer(state, action);
	};

	const preloadedState = initialStateProvider();

	const middlewareEnhancer = applyMiddleware(...middlewares);
	const enhancer = composeEnhancer ? composeEnhancer(middlewareEnhancer) : middlewareEnhancer;

	// eslint-disable-next-line @typescript-eslint/no-deprecated
	return createReduxStore(reducer, preloadedState, enhancer);
}

/**
 * A factory function to create the root reducer for Client.
 *
 * @param reducerMap Optional map of additional reducers
 * @param dataReducers Optional list of data reducers
 * @returns The default root reducer.
 */
function createRootReducer(
	reducerMap: ReducerMap = {},
	dataReducers: ActivityReducers.DataReducer[] = []
): Reducer<object> {
	const moduleReducers = (state: object) =>
		ModuleRegistryProvider.getInstance()
			.getAllModules()
			.flatMap(mod => mod.dataReducers?.(state) ?? []);

	return ModuleExtensions.createModulesReducer(
		combineReducers({
			...reducerMap,
			activities: ActivityReducers.createActivityReducers({
				dataReducers,
				moduleReducers
			}),
			locale: LocaleReducers.locale,
			models: ModelReducers.models,
			application: ApplicationReducers.application,
			notifications: NotificationReducers.notifications
		})
	);
}

function createInitialState(applicationModel: ApplicationModel, defaultLocale?: Locale): object {
	return {
		models: {
			applicationModel,
			modelGraph: {
				documentModels: [],
				relationshipModels: [],
				composeDocumentModels: []
			},
			models: {}
		},
		activities: {},
		locale: getLocaleFromStorage(defaultLocale),
		application: { busy: false, registeredModules: [] },
		notifications: []
	};
}
