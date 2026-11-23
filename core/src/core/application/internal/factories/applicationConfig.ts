// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/**
 * NOTE: Do not move or rename this file!
 *
 * This file includes the `A12ApplicationConfig` interface, which is augmented in other A12 packages (by using the exact file path).
 * Therefore any changes to this file's path will break it. See A12E-3587
 */

import type { ComponentType, PropsWithChildren } from "react";
import type { Store } from "redux";

import type {
	LayoutProvider,
	RegionUiProvider
} from "../../../frame/internal/layout/LayoutProps.js";
import type { FrameViews } from "../../../frame/internal/views.js";
import type { ApplicationModel } from "../../../model/internal/ApplicationModel.js";
import type { View } from "../../../view/internal/view.js";

import type { ApplicationFactories } from "./index.js";

type OptionalProvider<Provider extends (...args: never[]) => unknown> = (
	...args: Parameters<Provider>
) => ReturnType<Provider> | undefined;

export type ProviderConfig = {
	views?: OptionalProvider<View.Provider>;
	viewModifications?: (name: string) => ((v: View.ViewComponent) => View.ViewComponent) | undefined;
	layouts?: OptionalProvider<LayoutProvider>;
	layoutModifications?: (name: string) => ((l: FrameViews.Layout) => FrameViews.Layout) | undefined;
	regions?: OptionalProvider<RegionUiProvider>;
	progressIndicators?: OptionalProvider<View.ProgressComponentProvider>;
	errorBoundaries?: OptionalProvider<View.ErrorBoundaryProvider>;
};

type UIConfig = ProviderConfig & {
	rootRegionRef?: ApplicationModel.Region.Reference;
	dynamicConfig?: boolean;
	WrapperComponent?: ComponentType<PropsWithChildren>;
};

/**
 * @experimental
 */
export type BaseConfig = Omit<ApplicationFactories.Config, "model" | "modelLoader"> &
	Partial<Pick<ApplicationFactories.Config, "model" | "modelLoader">> &
	UIConfig;

type BaseConfigWithModelLoader<T extends BaseConfig> = Omit<T, "modelLoader"> & {
	modelLoader: ApplicationFactories.Config["modelLoader"];
};

/**
 * @experimental
 */
export type ApplicationWithConfiguredModelLoader<T extends A12ApplicationConfig> = T & {
	config: BaseConfigWithModelLoader<T["config"]>;
};

type BaseConfigWithModel<T extends BaseConfig> = Omit<T, "model"> & {
	model: ApplicationFactories.Config["model"];
};

/**
 * @experimental
 */
export type ApplicationWithConfiguredModel<T extends A12ApplicationConfig> = T & {
	config: BaseConfigWithModel<T["config"]>;
};

interface ClientConfig<C extends BaseConfig = BaseConfig> {
	config: C;
	initialActions?: (store: Store) => Promise<void>;
	configured?: {};
}

/**
 * @experimental
 */
export interface A12ApplicationConfig<C extends BaseConfig = BaseConfig> extends ClientConfig<C> {
	// intentionally empty, expanded via module augmentation
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
