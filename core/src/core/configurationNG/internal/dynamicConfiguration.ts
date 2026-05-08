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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
