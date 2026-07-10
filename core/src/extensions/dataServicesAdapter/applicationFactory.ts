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

import {
	DataServicesReducerMap,
	loadDataServicesConfiguration
} from "@com.mgmtp.a12.dataservices/dataservices-access";

import {
	addInitialAction,
	combineFeatures,
	setConfigured,
	withReducerMap
} from "../../core/application/internal/factories/applicationFactory.js";
import type {
	A12ApplicationConfig,
	ApplicationWithConfiguredFeature,
	RequireFeatures
} from "../../core/index.js";

declare module "../../core/index.js" {
	interface A12ApplicationConfig {
		dataServicesConfig?: unknown;
	}
}

/**
 * @experimental
 */
export type ApplicationWithDataServicesConfig = RequireFeatures<
	A12ApplicationConfig,
	{ dataServicesConfig?: never }
>;

/**
 * @experimental
 */
export const addDataServicesInitialAction = <T extends ApplicationWithDataServicesConfig>(cfg: T) =>
	addInitialAction<T>(loadDataServicesConfiguration)(cfg);

/**
 * @experimental
 */
export const addDataServicesReducerMap = <T extends ApplicationWithDataServicesConfig>(cfg: T) =>
	withReducerMap<T>(DataServicesReducerMap)(cfg);

/**
 * @experimental
 *
 * Adds the necessary configuration to enable the use of a dataservices-specific slice in the redux state.
 * See the A12 Dataservices documentation for information on how to retrieve data from the slice.
 */
export const withDataServicesConfiguration = <T extends ApplicationWithDataServicesConfig>(
	cfg: T
): ApplicationWithConfiguredFeature<T, "dataServicesConfig"> =>
	setConfigured<T, "dataServicesConfig">("dataServicesConfig")(
		combineFeatures(addDataServicesInitialAction, addDataServicesReducerMap)(cfg)
	);
