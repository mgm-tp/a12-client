// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { flow } from "fp-ts/lib/function.js";
import { Lens } from "monocle-ts";
import type { ComponentType, PropsWithChildren } from "react";
import type { Store } from "redux";

import type { Layout, RegionUiProps } from "../../../frame/internal/layout/LayoutProps.js";
import { ApplicationModel } from "../../../model/internal/ApplicationModel.js";
import type { View } from "../../../view/internal/view.js";

/* oxlint-disable no-unused-vars -- ProviderConfig and RequireFeatures are only referenced from JSDoc {@link}, see oxc-project/oxc#24996 */
import type {
	A12ApplicationConfig,
	ApplicationWithConfiguredFeature,
	ApplicationWithConfiguredModel,
	ApplicationWithConfiguredModelLoader,
	ProviderConfig,
	RequireFeatures
} from "./applicationConfig.js";
/* oxlint-enable no-unused-vars */
import { combineWrappers, createRootRegion } from "./rootRegionWrapper.js";

import { ApplicationFactories } from "./index.js";

const configLens = <T extends A12ApplicationConfig>() => Lens.fromProp<T>()("config");
const initialActionsLens = <T extends A12ApplicationConfig>() =>
	Lens.fromProp<T>()("initialActions");
const configuredLens = <T extends A12ApplicationConfig>() => Lens.fromProp<T>()("configured");
const configPropLens =
	<T extends A12ApplicationConfig>() =>
	<K extends keyof T["config"]>(prop: K) =>
		configLens<T>().compose(Lens.fromProp<T["config"]>()(prop));

/**
 * @experimental
 *
 * Adds one or more (potentially async) initialization functions. They are expected to be called by the user after the Redux store was initialized.
 * Functions are called in the order of registration.
 */
export const addInitialAction = <T extends A12ApplicationConfig>(
	...actions: readonly ((store: Store) => Promise<void> | void)[]
) =>
	initialActionsLens<T>().modify(other => async (store: Store) => {
		await other?.(store);
		for (const action of actions) {
			await action(store);
		}
	});

/**
 * @experimental
 *
 * Adds one or more {@link ApplicationFactories.Config.setupActions setupAction} to initialize the Redux store.
 * Actions are dispatched in the order of registration.
 */
export const addReduxSetupAction = <T extends A12ApplicationConfig>(
	...setupActions: NonNullable<ApplicationFactories.Config["setupActions"]>
) => configPropLens<T>()("setupActions").modify(others => [...(others ?? []), ...setupActions]);

/**
 * @experimental
 *
 * Adds a {@link ApplicationFactories.Config.applicationBusyTriggers applicationBusyTrigger}.
 */
export const addApplicationBusyTriggers = <T extends A12ApplicationConfig>(
	busyTriggers: NonNullable<ApplicationFactories.Config["applicationBusyTriggers"]>
) =>
	configPropLens<T>()("applicationBusyTriggers").modify(others => ({
		start: [...(others?.start ?? []), ...busyTriggers.start],
		end: [...(others?.end ?? []), ...busyTriggers.end]
	}));

/**
 * @experimental
 *
 * Sets and overrides the {@link ApplicationFactories.Config.applicationResetTriggers applicationResetTrigger}
 */
export const withApplicationResetTriggers = <T extends A12ApplicationConfig>(
	resetTriggers: NonNullable<ApplicationFactories.Config["applicationResetTriggers"]>
) => configPropLens<T>()("applicationResetTriggers").modify(() => resetTriggers);

/**
 * @experimental
 *
 * Adds one or more {@link ApplicationFactories.Config.dataHandlers dataHandler}. DataHandlers are
 * called in the order of registration.
 */
export const addDataHandlers = <T extends A12ApplicationConfig>(
	...dataHandlers: NonNullable<ApplicationFactories.Config["dataHandlers"]>
) => configPropLens<T>()("dataHandlers").modify(others => [...(others ?? []), ...dataHandlers]);

/**
 * @experimental
 *
 * Adds one or more {@link ApplicationFactories.Config.customSagas customSaga}. Sagas are registered
 * in the order of registration.
 */
export const addCustomSagas = <T extends A12ApplicationConfig>(
	...sagas: NonNullable<ApplicationFactories.Config["customSagas"]>
) => configPropLens<T>()("customSagas").modify(others => [...(others ?? []), ...sagas]);

/**
 * @experimental
 *
 * Adds one or more {@link ApplicationFactories.Config.additionalMiddlewares additionalMiddleware}. Middlewares
 * are registered in the order of registration.
 */
export const addAdditionalMiddlewares = <T extends A12ApplicationConfig>(
	...middlewares: NonNullable<ApplicationFactories.Config["additionalMiddlewares"]>
) =>
	configPropLens<T>()("additionalMiddlewares").modify(others => [
		...(others ?? []),
		...middlewares
	]);

/**
 * @experimental
 *
 * Adds one or more {@link ApplicationFactories.Config.dataReducers dataReducer}. DataReducers are
 * registered in the order of registration.
 */
export const addDataReducers = <T extends A12ApplicationConfig>(
	...dataReducers: NonNullable<ApplicationFactories.Config["dataReducers"]>
) => configPropLens<T>()("dataReducers").modify(others => [...(others ?? []), ...dataReducers]);

/**
 * @experimental
 *
 * Sets and merges the {@link ApplicationFactories.Config.reducerMap reducerMap} with the existing one, potentially
 * overriding existing reducers.
 */
export const withReducerMap = <T extends A12ApplicationConfig>(
	reducerMap: NonNullable<ApplicationFactories.Config["reducerMap"]>
) => configPropLens<T>()("reducerMap").modify(others => ({ ...others, ...reducerMap }));

/**
 * @experimental
 *
 * Adds a {@link ApplicationFactories.Config.rootReducer rootReducer}. Root reducer are
 * called in the order of registration.
 */
export const addRootReducer = <T extends A12ApplicationConfig>(
	rootReducer: NonNullable<ApplicationFactories.Config["rootReducer"]>
) =>
	configPropLens<T>()("rootReducer").modify(existing =>
		existing ? flow(existing, rootReducer) : rootReducer
	);

/**
 * @experimental
 *
 * Adds one or more {@link ApplicationFactories.Config.overridePlatformSagas overridePlatformSaga}. Sagas
 * are registered in the order of registration.
 */
export const addPlatformSagas = <T extends A12ApplicationConfig>(
	...platformSagas: NonNullable<ApplicationFactories.Config["overridePlatformSagas"]>
) =>
	configPropLens<T>()("overridePlatformSagas").modify(others => [
		...(others ?? []),
		...platformSagas
	]);

/**
 * @experimental
 *
 * Sets and overrides the {@link ApplicationFactories.Config.modelLoader modelLoader}.
 */
export const withModelLoader =
	<T extends A12ApplicationConfig>(modelLoader: ApplicationFactories.Config["modelLoader"]) =>
	({ config, ...t }: T): ApplicationWithConfiguredModelLoader<T> => {
		const newConfig = { ...config, modelLoader };
		return { ...t, config: newConfig } as ApplicationWithConfiguredModelLoader<T>;
	};

/**
 * @experimental
 *
 * Sets and overrides the {@link ApplicationFactories.Config.model applicationModel}.
 */
export const withModel =
	<T extends A12ApplicationConfig>(model: ApplicationFactories.Config["model"]) =>
	({ config, ...t }: T): ApplicationWithConfiguredModel<T> => {
		const newConfig = { ...config, model };
		return { ...t, config: newConfig } as ApplicationWithConfiguredModel<T>;
	};

/**
 * @experimental
 *
 * Registers a view to be used with a {@link View.Provider}. Registering a second view with the same name
 * overrides the first.
 */
export const addView = <T extends A12ApplicationConfig>(name: string, view: View.ViewComponent) => {
	const provider = (componentName: string) => (componentName === name ? view : undefined);
	return configPropLens<T>()("views").modify(
		existing => (componentName: string) => provider(componentName) ?? existing?.(componentName)
	);
};

/**
 * @experimental
 *
 * Adds a modification function for the view, to change the component or its props.
 * If a view with that name is not registered, it will never be called. Multiple modifications are called
 * in order of registration.
 */
export const modifyView = <T extends A12ApplicationConfig>(
	name: string,
	fn: (view: View.ViewComponent) => View.ViewComponent
) => {
	const provider = (componentName: string) => (componentName === name ? fn : undefined);
	return configPropLens<T>()("viewModifications").modify(existing => (componentName: string) => {
		const existingModify = existing?.(componentName);
		const currentModify = provider(componentName);
		return existingModify && currentModify
			? flow(existingModify, currentModify)
			: (currentModify ?? existingModify);
	});
};

/**
 * @experimental
 *
 * Registers a layout to be used with a LayoutProvider. Registering a second layout with the same name
 * overrides the first.
 */
export const addLayout = <T extends A12ApplicationConfig>(name: string, layout: Layout) => {
	const provider = (componentName: string) => (componentName === name ? layout : undefined);
	return configPropLens<T>()("layouts").modify(
		existing => (componentName: string) => provider(componentName) ?? existing?.(componentName)
	);
};

/**
 * @experimental
 *
 * Adds a modification function for the layout, to change the layout or its props.
 * If a layout with that name is not registered, it will never be called. Multiple modifications are called
 * in order of registration.
 */
export const modifyLayout = <T extends A12ApplicationConfig>(
	name: string,
	fn: (layout: Layout) => Layout
) => {
	const provider = (componentName: string) => (componentName === name ? fn : undefined);
	return configPropLens<T>()("layoutModifications").modify(existing => (componentName: string) => {
		const existingModify = existing?.(componentName);
		const currentModify = provider(componentName);
		return existingModify && currentModify
			? flow(existingModify, currentModify)
			: (currentModify ?? existingModify);
	});
};

/**
 * @experimental
 *
 * Registers a region to be used with a RegionProvider. Registering a second region with the same reference
 * overrides the first.
 */
export const addRegion = <T extends A12ApplicationConfig>(
	regionReference: ApplicationModel.Region.Reference,
	region: ComponentType<RegionUiProps>
) => {
	const provider = (regionRef: ApplicationModel.Region.Reference) =>
		ApplicationModel.Region.Reference.equal(regionRef, regionReference) ? region : undefined;
	return configPropLens<T>()("regions").modify(
		existing => (regionRef: ApplicationModel.Region.Reference) =>
			provider(regionRef) ?? existing?.(regionRef)
	);
};

/**
 * @experimental
 *
 * Registers a progress indicator to be used with a ProgressComponentProvider.
 * Registering a second provider with the same reference and viewName overrides the first.
 */
export const addProgressIndicator = <T extends A12ApplicationConfig>(
	regionReference: ApplicationModel.Region.Reference,
	viewName: string,
	progressIndicator: ComponentType<View.ProgressComponentProvider.PropsType>
) => {
	const provider = (regionRef: ApplicationModel.Region.Reference, vName: string) =>
		ApplicationModel.Region.Reference.equal(regionRef, regionReference) && vName === viewName
			? progressIndicator
			: undefined;
	return configPropLens<T>()("progressIndicators").modify(
		existing => (regionRef: ApplicationModel.Region.Reference, vName: string) =>
			provider(regionRef, vName) ?? existing?.(regionRef, vName)
	);
};

/**
 * @experimental
 *
 * Registers a error boundary to be used with a ErrorBoundaryProvider.
 * Registering a second boundary with the same reference and viewName overrides the first.
 */
export const addErrorBoundary = <T extends A12ApplicationConfig>(
	regionReference: ApplicationModel.Region.Reference,
	viewName: string,
	errorBoundary: ComponentType<View.ErrorBoundaryProvider.PropsType>
) => {
	const provider = (regionRef: ApplicationModel.Region.Reference, vName: string) =>
		ApplicationModel.Region.Reference.equal(regionRef, regionReference) && vName === viewName
			? errorBoundary
			: undefined;
	return configPropLens<T>()("errorBoundaries").modify(
		existing => (regionRef: ApplicationModel.Region.Reference, vName: string) =>
			provider(regionRef, vName) ?? existing?.(regionRef, vName)
	);
};

/**
 * @experimental
 *
 * Adds a new React component to the component stack. Either at the outer or the inner most
 * position, based on "position".
 */
export const addWrapper = <T extends A12ApplicationConfig>(
	AdditionalWrapper: ComponentType<PropsWithChildren>,
	position: "inner" | "outer" = "inner"
) =>
	configPropLens<T>()("WrapperComponent").modify(Wrapper =>
		Wrapper === undefined
			? AdditionalWrapper
			: position === "inner"
				? combineWrappers(AdditionalWrapper, Wrapper)
				: combineWrappers(Wrapper, AdditionalWrapper)
	);

/**
 * @experimental
 **/
export const addComposeEnhancer = <T extends A12ApplicationConfig>(
	enhancer: NonNullable<ApplicationFactories.Config["composeEnhancer"]>
) =>
	configPropLens<T>()("composeEnhancer").modify(existing =>
		existing ? flow(existing, enhancer) : enhancer
	);

/**
 * @experimental
 *
 * Configures the setup to use DynamicConfig. This means you are responsible for registering a
 * DynamicConfiguration module with regions and flows. The configured {@link ApplicationFactories.Config.model applicationModel}
 * and {@link ProviderConfig provider related configs} are ignored.
 */
export const withDynamicConfig = <T extends A12ApplicationConfig>() =>
	configPropLens<T>()("dynamicConfig").modify(() => true);

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

/**
 * @experimental
 *
 * The entry point for the A12 application setup. Returns the Redux store, a function that you should call
 * to initialize the application and a React Component that you should render.
 */
export function createA12ApplicationSetup(
	appConfig: A12ApplicationConfig<ApplicationFactories.Config>
) {
	const { store } = ApplicationFactories.createApplicationSetup(appConfig.config);

	return {
		store,
		initialActions: () => appConfig.initialActions?.(store) ?? Promise.resolve(),
		Component: createRootRegion(appConfig, store)
	};
}
