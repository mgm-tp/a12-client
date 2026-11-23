// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Module } from "../../application/internal/factories/module.js";
import type { SelectorOrObject } from "../../store/internal/selectors.js";

import type { DynamicFlow, DynamicMenu, DynamicRegion } from "./typings.js";

/**
 * @experimental
 *
 * Same as {@link Module}, but allows to contribute appmodel fragments dynamically. Each property can either be set
 * to a constant or to a selector function. This allows you to create the app model properties based on the Redux state,
 * e.g. from the currently matched activity.
 */
export interface DynamicConfiguration extends Module {
	/**
	 * This property is not allowed to be set.
	 *
	 * Use {@link DynamicConfiguration.menus}, {@link DynamicConfiguration.flows} and {@link DynamicConfiguration.regions} to contribute appmodel fragments instead.
	 */
	readonly model?: never;

	/**
	 * This property is not allowed to be set.
	 *
	 * When using the {@link DynamicConfiguration.flows} property, specify your view components directly.
	 */
	readonly views?: never;

	/**
	 * Allows contributing dynamic appmodel menu entries
	 */
	readonly menus?: SelectorOrObject<DynamicMenu[]>;

	/**
	 * Allows contributing dynamic appmodel flows
	 */
	readonly flows?: SelectorOrObject<DynamicFlow[]>;

	/**
	 * Allows contributing dynamic appmodel regions
	 */
	readonly regions?: SelectorOrObject<DynamicRegion[]>;
}
