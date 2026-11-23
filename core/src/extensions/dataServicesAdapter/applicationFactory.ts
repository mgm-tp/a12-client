// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import {
	DataServicesReducerMap,
	loadDataServicesConfiguration
} from "@com.mgmtp.a12.dataservices/dataservices-access";

import type {
	A12ApplicationConfig,
	ApplicationWithConfiguredFeature,
	RequireFeatures
} from "../../core/application/internal/factories/applicationConfig.js";
import {
	addInitialAction,
	combineFeatures,
	setConfigured,
	withReducerMap
} from "../../core/application/internal/factories/applicationFactory.js";

declare module "../../core/application/internal/factories/applicationConfig.js" {
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
