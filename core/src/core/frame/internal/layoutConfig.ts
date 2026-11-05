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

/*
 * Layouts and regions are a `frame` concept, so their config surface lives here
 * rather than in `application`. The `layouts` / `layoutModifications` / `regions`
 * fields are contributed onto the application config via module augmentation of
 * `ProviderConfig`, and the matching builders live alongside. This keeps the
 * layering `frame -> application` intact (`application` never references frame
 * layout types). See A12C-3300.
 */

import type { ComponentType } from "react";

import type {
	A12ApplicationConfig,
	OptionalProvider
} from "../../application/internal/factories/applicationConfig.js";
import { configPropLens } from "../../application/internal/factories/configLens.js";
import { ApplicationModel } from "../../model/internal/ApplicationModel.js";

import type { Layout, RegionUiProps, RegionUiProvider } from "./layout/LayoutProps.js";

/**
 * @experimental
 *
 * A registered layout modification, applied once (at app build time) to the base layout registered under
 * `name` via `addLayout` (or a built-in default).
 */
export type LayoutModification = {
	readonly name: string;
	readonly modify: (layout: Layout) => Layout;
};

declare module "../../application/internal/factories/applicationConfig.js" {
	interface ProviderConfig {
		/** Layouts registered by name. Folded with `layoutModifications` once, at build time. */
		layouts?: Readonly<Record<string, Layout>>;

		/**
		 * Modifications applied once, at build time, to the base layout registered under each `name`
		 * (via `addLayout` or a built-in default). Multiple modifications for the same name are applied
		 * in order of registration.
		 */
		layoutModifications?: readonly LayoutModification[];

		/** Resolves a region reference to the component that renders that region. */
		regions?: OptionalProvider<RegionUiProvider>;
	}
}

/**
 * @experimental
 *
 * Registers a layout to be used with a LayoutProvider. Registering a second layout with the same name
 * overrides the first.
 */
export const addLayout =
	(name: string, layout: Layout) =>
	<T extends A12ApplicationConfig>(cfg: T): T =>
		configPropLens<T>()("layouts").modify(existing => ({ ...existing, [name]: layout }))(cfg);

/**
 * @experimental
 *
 * Adds a modification function for the layout, to change the layout or its props. It is applied once,
 * when the app is built, to the layout registered under `name` (via {@link addLayout} or a built-in
 * default). If no such layout exists, it has no effect (and, in development, logs a warning). Multiple
 * modifications for the same name are applied in order of registration.
 */
export const modifyLayout =
	(name: string, fn: (layout: Layout) => Layout) =>
	<T extends A12ApplicationConfig>(cfg: T): T =>
		configPropLens<T>()("layoutModifications").modify(existing => [
			...(existing ?? []),
			{ name, modify: fn }
		])(cfg);

/**
 * @experimental
 *
 * Registers a region to be used with a RegionProvider. Registering a second region with the same reference
 * overrides the first.
 */
export const addRegion =
	(regionReference: ApplicationModel.Region.Reference, region: ComponentType<RegionUiProps>) =>
	<T extends A12ApplicationConfig>(cfg: T): T => {
		const provider = (regionRef: ApplicationModel.Region.Reference) =>
			ApplicationModel.Region.Reference.equal(regionRef, regionReference) ? region : undefined;
		return configPropLens<T>()("regions").modify(
			existing => (regionRef: ApplicationModel.Region.Reference) =>
				provider(regionRef) ?? existing?.(regionRef)
		)(cfg);
	};
