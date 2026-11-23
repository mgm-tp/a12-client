// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/**
 * @experimental
 *
 * Everything from this package is considered experimental and subject to changes.
 *
 * This package contains functionality to configure an A12 Client application without
 * using application models. Instead, regions, layouts and scenes can be expressed
 * via code.
 *
 * @packageDocumentation
 */

export type { DynamicConfiguration } from "./internal/dynamicConfiguration.js";

export { AppmodelToDynamicConfigurationAdapter } from "./internal/adaptAppModel.js";

export type {
	DynamicAddView,
	DynamicCase,
	DynamicClearRegion,
	DynamicDirective,
	DynamicFlow,
	DynamicMatchCondition,
	DynamicMenu,
	DynamicRegion,
	DynamicScene,
	DynamicSceneChange
} from "./internal/typings.js";

export { DynamicModelSelectors } from "./internal/dynamicSelectors.js";
