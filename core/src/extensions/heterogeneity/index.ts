// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/**
 * This package contains functionality related to the A12 heterogeneity feature
 * (experimental).
 *
 * Please refer to the Client documentation for a general description of the
 * heterogeneity feature.
 *
 * @packageDocumentation
 */
export { RESOURCE_KEYS as HETEROGENEITY_RESOURCE_KEYS } from "./internal/languages/index.js";
export { defaultVariantSelectionMapper } from "./internal/variant-selection-mapper.js";
export type {
	VariantSelectionItem,
	VariantSelectionMapper
} from "./internal/variant-selection-mapper.js";
export { VariantSelection } from "./internal/variant-selection-ui.js";
export type { VariantSelectionProps } from "./internal/variant-selection-ui.js";
