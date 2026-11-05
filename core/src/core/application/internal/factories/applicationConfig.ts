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

/**
 * NOTE: Do not move or rename this file!
 *
 * This file includes the `A12ApplicationConfig` interface, which is augmented in other A12 packages (by using the exact file path).
 * Therefore any changes to this file's path will break it. See A12E-3587
 */

import type { ComponentType, PropsWithChildren } from "react";
import type { Store } from "redux";

import type { ApplicationModel } from "../../../model/internal/ApplicationModel.js";
import type { View } from "../../../view/internal/view.js";

import type { GenericModelLoaderOptions } from "./genericModelLoaderOptions.js";

import type { ApplicationFactories } from "./index.js";

/**
 * @experimental
 *
 * A provider that may decline to answer. Returning `undefined` means "no opinion",
 * so the application falls back to the next provider and finally to the `frame`
 * default.
 */
export type OptionalProvider<Provider extends (...args: never[]) => unknown> = (
	...args: Parameters<Provider>
) => ReturnType<Provider> | undefined;

/**
 * @experimental
 *
 * A registered view modification, applied once (at app build time) to the base view registered under
 * `name` via {@link ProviderConfig.views} (set with `addView`, or a built-in default).
 */
export type ViewModification = {
	readonly name: string;
	readonly modify: (view: View.ViewComponent) => View.ViewComponent;
};

/**
 * @experimental
 *
 * Provider hooks the application consults when it renders a region: which
 * component to use for a view, layout or region, and what to show while a view
 * loads or fails. Every hook is optional; whatever is not provided (or returns
 * `undefined`) falls back to the `frame` default.
 *
 * Layout and region providers (`layouts`, `layoutModifications`, `regions`) are
 * contributed by the `frame` layer via module augmentation, keeping `application`
 * free of any `frame` dependency. Register entries with the matching builders
 * (`addView`, `addLayout`, `addRegion`, ...) rather than assigning the fields
 * directly, so multiple registrations chain instead of overwriting each other.
 */
export interface ProviderConfig {
	/** Views registered by name. Folded with `viewModifications` once, at build time. */
	views?: Readonly<Record<string, View.ViewComponent>>;

	/**
	 * Modifications applied once, at build time, to the base view registered under each `name`
	 * (via `addView` or a built-in default). Multiple modifications for the same name are applied
	 * in order of registration.
	 */
	viewModifications?: readonly ViewModification[];

	/** Resolves a region and view name to the component shown while that view loads. */
	progressIndicators?: OptionalProvider<View.ProgressComponentProvider>;

	/** Resolves a region and view name to the error boundary wrapping that view. */
	errorBoundaries?: OptionalProvider<View.ErrorBoundaryProvider>;
}

/**
 * @experimental
 *
 * The UI half of an application's configuration: which providers render it, and
 * where it is rooted.
 */
export type UIConfig = ProviderConfig & {
	/**
	 * The region the application renders at its root. Defaults to the empty
	 * reference, i.e. the application model's root region.
	 */
	rootRegionRef?: ApplicationModel.Region.Reference;

	/**
	 * Renders the root region from a registered DynamicConfiguration instead of
	 * from the application model. When set, the configured application model and
	 * the provider hooks above are ignored — set it with `withDynamicConfig`.
	 */
	dynamicConfig?: boolean;

	/**
	 * Wraps the whole application, for context providers that must sit above the
	 * root region. Use `addWrapper` to add one without dropping wrappers that
	 * other features already registered.
	 */
	WrapperComponent?: ComponentType<PropsWithChildren>;
};

/**
 * @experimental
 */
export type BaseConfig = Omit<ApplicationFactories.Config, "model" | "modelLoader"> &
	Partial<Pick<ApplicationFactories.Config, "model" | "modelLoader">> &
	UIConfig;

/**
 * @experimental
 */
export type BaseConfigWithModelLoader<T extends BaseConfig> = Omit<T, "modelLoader"> & {
	modelLoader: ApplicationFactories.Config["modelLoader"];
};

/**
 * @experimental
 */
export type ApplicationWithConfiguredModelLoader<T extends A12ApplicationConfig> = T & {
	config: BaseConfigWithModelLoader<T["config"]>;
};

/**
 * @experimental
 */
export type BaseConfigWithModel<T extends BaseConfig> = Omit<T, "model"> & {
	model: ApplicationFactories.Config["model"];
};

/**
 * @experimental
 */
export type ApplicationWithConfiguredModel<T extends A12ApplicationConfig> = T & {
	config: Omit<T["config"], "model"> & { model: ApplicationFactories.Config["model"] };
};

/**
 * @experimental
 *
 * The parts of an {@link A12ApplicationConfig} that are not features. {@link RequireFeatures}
 * excludes these keys, so anything added here is exempt from feature guarding.
 */
export interface ClientConfig<C extends BaseConfig = BaseConfig> {
	config: C;
	initialActions?: (store: Store) => Promise<void>;
	configured?: {};
}

/**
 * @experimental
 */
export interface A12ApplicationConfig<C extends BaseConfig = BaseConfig> extends ClientConfig<C> {
	/**
	 * Names the `withModel` feature for {@link RequireFeatures}. Carries no options - the
	 * application model is passed to `withModel` directly.
	 */
	model?: unknown;

	/**
	 * Model loading options, consumed by the model loader features of the modelLoader extension.
	 * Also names the model loader feature for {@link RequireFeatures}.
	 */
	modelLoader?: GenericModelLoaderOptions;

	/**
	 * Names the `withDynamicConfig` feature for {@link RequireFeatures}. Carries no options - the
	 * flag the feature sets lives in {@link ProviderConfig | the setup config}.
	 */
	dynamicConfig?: unknown;
}

/**
 * @experimental
 */
export type ApplicationWithConfiguredFeature<
	T extends A12ApplicationConfig,
	K extends keyof T
> = Omit<T, "configured"> & { configured: Record<keyof T["configured"] | K, true> };

/**
 * @experimental
 */
export type RequireFeatures<
	T extends A12ApplicationConfig,
	F extends Partial<Record<Exclude<keyof T, keyof ClientConfig>, true | undefined>>
> = T & {
	configured?: { [feature: string]: true } & F;
};

/**
 * @experimental
 *
 * A config the `withModel` feature may still be installed on.
 */
export type ApplicationWithModelConfig = RequireFeatures<A12ApplicationConfig, { model?: never }>;

/**
 * @experimental
 *
 * A config a model loader feature may still be installed on.
 */
export type ApplicationWithModelLoaderConfig = RequireFeatures<
	A12ApplicationConfig,
	{ modelLoader?: never }
>;

/**
 * @experimental
 *
 * A config the `withDynamicConfig` feature may still be installed on.
 */
export type ApplicationWithDynamicConfigConfig = RequireFeatures<
	A12ApplicationConfig,
	{ dynamicConfig?: never }
>;
