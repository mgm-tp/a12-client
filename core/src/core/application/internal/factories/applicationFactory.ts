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

import { flow } from "fp-ts/lib/function.js";
import { Lens } from "monocle-ts";
import type { ComponentType, PropsWithChildren } from "react";
import type { Store } from "redux";

import { ApplicationModel } from "../../../model/internal/ApplicationModel.js";
import type { View } from "../../../view/internal/view.js";

/* oxlint-disable no-unused-vars -- ProviderConfig and RequireFeatures are only referenced from JSDoc {@link}, see oxc-project/oxc#24996 */
import type {
	A12ApplicationConfig,
	ApplicationWithConfiguredFeature,
	ApplicationWithConfiguredModel,
	ApplicationWithConfiguredModelLoader,
	ApplicationWithDynamicConfigConfig,
	ApplicationWithModelConfig,
	ApplicationWithModelLoaderConfig,
	ProviderConfig,
	RequireFeatures
} from "./applicationConfig.js";
/* oxlint-enable no-unused-vars */
import { combineWrappers } from "./combineWrappers.js";
import { configPropLens } from "./configLens.js";

import type { ApplicationFactories } from "./index.js";

const initialActionsLens = <T extends A12ApplicationConfig>() =>
	Lens.fromProp<T>()("initialActions");
const configuredLens = <T extends A12ApplicationConfig>() => Lens.fromProp<T>()("configured");

/**
 * @experimental
 *
 * Adds one or more (potentially async) initialization functions. They are expected to be called by the user after the Redux store was initialized.
 * Functions are called in the order of registration.
 */
export const addInitialAction =
	(...actions: readonly ((store: Store) => Promise<void> | void)[]) =>
	<T extends A12ApplicationConfig>(cfg: T): T =>
		initialActionsLens<T>().modify(other => async (store: Store) => {
			await other?.(store);
			for (const action of actions) {
				await action(store);
			}
		})(cfg);

/**
 * @experimental
 *
 * Adds one or more {@link ApplicationFactories.Config.setupActions setupAction} to initialize the Redux store.
 * Actions are dispatched in the order of registration.
 */
export const addReduxSetupAction =
	(...setupActions: NonNullable<ApplicationFactories.Config["setupActions"]>) =>
	<T extends A12ApplicationConfig>(cfg: T): T =>
		configPropLens<T>()("setupActions").modify(others => [...(others ?? []), ...setupActions])(cfg);

/**
 * @experimental
 *
 * Adds a {@link ApplicationFactories.Config.applicationBusyTriggers applicationBusyTrigger}.
 */
export const addApplicationBusyTriggers =
	(busyTriggers: NonNullable<ApplicationFactories.Config["applicationBusyTriggers"]>) =>
	<T extends A12ApplicationConfig>(cfg: T): T =>
		configPropLens<T>()("applicationBusyTriggers").modify(others => ({
			start: [...(others?.start ?? []), ...busyTriggers.start],
			end: [...(others?.end ?? []), ...busyTriggers.end]
		}))(cfg);

/**
 * @experimental
 *
 * Sets the {@link ApplicationFactories.Config.applicationResetTriggers applicationResetTriggers},
 * overriding any that were set before.
 */
export const setApplicationResetTriggers =
	(resetTriggers: NonNullable<ApplicationFactories.Config["applicationResetTriggers"]>) =>
	<T extends A12ApplicationConfig>(cfg: T): T =>
		configPropLens<T>()("applicationResetTriggers").modify(() => resetTriggers)(cfg);

/**
 * @experimental
 *
 * Adds one or more {@link ApplicationFactories.Config.dataHandlers dataHandler}. DataHandlers are
 * called in the order of registration.
 */
export const addDataHandlers =
	(...dataHandlers: NonNullable<ApplicationFactories.Config["dataHandlers"]>) =>
	<T extends A12ApplicationConfig>(cfg: T): T =>
		configPropLens<T>()("dataHandlers").modify(others => [...(others ?? []), ...dataHandlers])(cfg);

/**
 * @experimental
 *
 * Adds one or more {@link ApplicationFactories.Config.customSagas customSaga}. Sagas are registered
 * in the order of registration.
 */
export const addCustomSagas =
	(...sagas: NonNullable<ApplicationFactories.Config["customSagas"]>) =>
	<T extends A12ApplicationConfig>(cfg: T): T =>
		configPropLens<T>()("customSagas").modify(others => [...(others ?? []), ...sagas])(cfg);

/**
 * @experimental
 *
 * Adds one or more {@link ApplicationFactories.Config.additionalMiddlewares additionalMiddleware}. Middlewares
 * are registered in the order of registration.
 */
export const addAdditionalMiddlewares =
	(...middlewares: NonNullable<ApplicationFactories.Config["additionalMiddlewares"]>) =>
	<T extends A12ApplicationConfig>(cfg: T): T =>
		configPropLens<T>()("additionalMiddlewares").modify(others => [
			...(others ?? []),
			...middlewares
		])(cfg);

/**
 * @experimental
 *
 * Adds one or more {@link ApplicationFactories.Config.dataReducers dataReducer}. DataReducers are
 * registered in the order of registration.
 */
export const addDataReducers =
	(...dataReducers: NonNullable<ApplicationFactories.Config["dataReducers"]>) =>
	<T extends A12ApplicationConfig>(cfg: T): T =>
		configPropLens<T>()("dataReducers").modify(others => [...(others ?? []), ...dataReducers])(cfg);

/**
 * @experimental
 *
 * Merges the given reducers into the {@link ApplicationFactories.Config.reducerMap reducerMap},
 * potentially overriding reducers registered under the same key.
 */
export const addReducerMap =
	(reducerMap: NonNullable<ApplicationFactories.Config["reducerMap"]>) =>
	<T extends A12ApplicationConfig>(cfg: T): T =>
		configPropLens<T>()("reducerMap").modify(others => ({ ...others, ...reducerMap }))(cfg);

/**
 * @experimental
 *
 * Adds a {@link ApplicationFactories.Config.rootReducer rootReducer}. Root reducer are
 * called in the order of registration.
 */
export const addRootReducer =
	(rootReducer: NonNullable<ApplicationFactories.Config["rootReducer"]>) =>
	<T extends A12ApplicationConfig>(cfg: T): T =>
		configPropLens<T>()("rootReducer").modify(existing =>
			existing ? flow(existing, rootReducer) : rootReducer
		)(cfg);

/**
 * @experimental
 *
 * Adds one or more {@link ApplicationFactories.Config.overridePlatformSagas overridePlatformSaga}. Sagas
 * are registered in the order of registration.
 */
export const addPlatformSagas =
	(...platformSagas: NonNullable<ApplicationFactories.Config["overridePlatformSagas"]>) =>
	<T extends A12ApplicationConfig>(cfg: T): T =>
		configPropLens<T>()("overridePlatformSagas").modify(others => [
			...(others ?? []),
			...platformSagas
		])(cfg);

/**
 * @internal
 */
export const setModelLoaderOnConfig =
	(modelLoader: ApplicationFactories.Config["modelLoader"]) =>
	<T extends A12ApplicationConfig>({
		config,
		...t
	}: T): ApplicationWithConfiguredModelLoader<T> => {
		const newConfig = { ...config, modelLoader };
		return { ...t, config: newConfig } as ApplicationWithConfiguredModelLoader<T>;
	};

/**
 * @internal
 */
export const setModelOnConfig =
	(model: ApplicationFactories.Config["model"]) =>
	<T extends A12ApplicationConfig>({ config, ...t }: T): ApplicationWithConfiguredModel<T> => {
		const newConfig = { ...config, model };
		return { ...t, config: newConfig } as ApplicationWithConfiguredModel<T>;
	};

/**
 * @experimental
 *
 * Installs the given {@link ApplicationFactories.Config.modelLoader modelLoader} into the setup.
 *
 * Make sure nobody configures model loading after this feature has been installed.
 */
export const withModelLoader =
	(modelLoader: ApplicationFactories.Config["modelLoader"]) =>
	<T extends ApplicationWithModelLoaderConfig>(
		cfg: T
	): ApplicationWithConfiguredFeature<ApplicationWithConfiguredModelLoader<T>, "modelLoader"> =>
		setConfigured<ApplicationWithConfiguredModelLoader<T>, "modelLoader">("modelLoader")(
			setModelLoaderOnConfig(modelLoader)(cfg)
		);

/**
 * @experimental
 *
 * Installs the given {@link ApplicationFactories.Config.model applicationModel} into the setup.
 *
 * Make sure nobody configures the application model after this feature has been installed.
 */
export const withModel =
	(model: ApplicationFactories.Config["model"]) =>
	<T extends ApplicationWithModelConfig>(
		cfg: T
	): ApplicationWithConfiguredFeature<ApplicationWithConfiguredModel<T>, "model"> =>
		setConfigured<ApplicationWithConfiguredModel<T>, "model">("model")(
			setModelOnConfig(model)(cfg)
		);

/**
 * @experimental
 *
 * Registers a view to be used with a {@link View.Provider}. Registering a second view with the same name
 * overrides the first.
 */
export const addView =
	(name: string, view: View.ViewComponent) =>
	<T extends A12ApplicationConfig>(cfg: T): T =>
		configPropLens<T>()("views").modify(existing => ({ ...existing, [name]: view }))(cfg);

/**
 * @experimental
 *
 * Adds a modification function for the view, to change the component or its props. It is applied once,
 * when the app is built, to the view registered under `name` (via {@link addView} or a built-in default).
 * If no such view exists, it has no effect (and, in development, logs a warning). Multiple modifications
 * for the same name are applied in order of registration.
 */
export const modifyView =
	(name: string, fn: (view: View.ViewComponent) => View.ViewComponent) =>
	<T extends A12ApplicationConfig>(cfg: T): T =>
		configPropLens<T>()("viewModifications").modify(existing => [
			...(existing ?? []),
			{ name, modify: fn }
		])(cfg);

/**
 * @experimental
 *
 * Registers a progress indicator to be used with a ProgressComponentProvider.
 * Registering a second provider with the same reference and viewName overrides the first.
 */
export const addProgressIndicator =
	(
		regionReference: ApplicationModel.Region.Reference,
		viewName: string,
		progressIndicator: ComponentType<View.ProgressComponentProvider.PropsType>
	) =>
	<T extends A12ApplicationConfig>(cfg: T): T => {
		const provider = (regionRef: ApplicationModel.Region.Reference, vName: string) =>
			ApplicationModel.Region.Reference.equal(regionRef, regionReference) && vName === viewName
				? progressIndicator
				: undefined;
		return configPropLens<T>()("progressIndicators").modify(
			existing => (regionRef: ApplicationModel.Region.Reference, vName: string) =>
				provider(regionRef, vName) ?? existing?.(regionRef, vName)
		)(cfg);
	};

/**
 * @experimental
 *
 * Registers a error boundary to be used with a ErrorBoundaryProvider.
 * Registering a second boundary with the same reference and viewName overrides the first.
 */
export const addErrorBoundary =
	(
		regionReference: ApplicationModel.Region.Reference,
		viewName: string,
		errorBoundary: ComponentType<View.ErrorBoundaryProvider.PropsType>
	) =>
	<T extends A12ApplicationConfig>(cfg: T): T => {
		const provider = (regionRef: ApplicationModel.Region.Reference, vName: string) =>
			ApplicationModel.Region.Reference.equal(regionRef, regionReference) && vName === viewName
				? errorBoundary
				: undefined;
		return configPropLens<T>()("errorBoundaries").modify(
			existing => (regionRef: ApplicationModel.Region.Reference, vName: string) =>
				provider(regionRef, vName) ?? existing?.(regionRef, vName)
		)(cfg);
	};

/**
 * @experimental
 *
 * Adds a new React component to the component stack. Either at the outer or the inner most
 * position, based on "position".
 */
export const addWrapper =
	(AdditionalWrapper: ComponentType<PropsWithChildren>, position: "inner" | "outer" = "inner") =>
	<T extends A12ApplicationConfig>(cfg: T): T =>
		configPropLens<T>()("WrapperComponent").modify(Wrapper =>
			Wrapper === undefined
				? AdditionalWrapper
				: position === "inner"
					? combineWrappers(AdditionalWrapper, Wrapper)
					: combineWrappers(Wrapper, AdditionalWrapper)
		)(cfg);

/**
 * @experimental
 **/
export const addComposeEnhancer =
	(enhancer: NonNullable<ApplicationFactories.Config["composeEnhancer"]>) =>
	<T extends A12ApplicationConfig>(cfg: T): T =>
		configPropLens<T>()("composeEnhancer").modify(existing =>
			existing ? flow(existing, enhancer) : enhancer
		)(cfg);

/**
 * @experimental
 *
 * Configures the setup to use DynamicConfig. This means you are responsible for registering a
 * DynamicConfiguration module with regions and flows. The configured {@link ApplicationFactories.Config.model applicationModel}
 * and {@link ProviderConfig provider related configs} are ignored.
 */
export const withDynamicConfig = <T extends ApplicationWithDynamicConfigConfig>(
	cfg: T
): ApplicationWithConfiguredFeature<T, "dynamicConfig"> =>
	setConfigured<T, "dynamicConfig">("dynamicConfig")(
		configPropLens<T>()("dynamicConfig").modify(() => true)(cfg)
	);

/**
 * @experimental
 *
 * Sets a specific features as configured. Can be used with {@link RequireFeatures} to prevent misconfigurations.
 */
export function setConfigured<T extends A12ApplicationConfig, K extends keyof T>(
	feature: K
): (t: T) => ApplicationWithConfiguredFeature<T, K> {
	return t =>
		configuredLens<T>().modify(c => ({ ...c, [feature]: true }))(
			t
		) as unknown as ApplicationWithConfiguredFeature<T, K>;
}

/**
 * @experimental
 *
 * Can be used to combine different features and returns a higher-order function,
 * that should accept the initial A12 config.
 *
 * Features may declare other features they depend on or that must not exist yet.
 * If you try to combine features in an incorrect order, it will fail at compile time
 * with the config being of type 'never'.
 *
 * Re-exported "flow" from "fp-ts". Note that you can only combine up to 9 features.
 * If you have more, combine smaller subsets first and then combine the result again.
 */
export const combineFeatures = flow;
