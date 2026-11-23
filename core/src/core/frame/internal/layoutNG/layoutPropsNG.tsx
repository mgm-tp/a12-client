// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/**
 * @experimental
 *
 * Every export from this file is considered experimental and subject to changes.
 */

import type { ComponentType } from "react";

import type { ViewNG } from "../../../view/internal/viewNG.js";

/**
 * Same as the old Region.Reference, but "join"-ed as a string for easier handling
 */
export type RegionReferenceNG = string;

export type RegionUiPropsNG = {
	// this has to be a regionRef that refers to region created by a DynamicConfiguration selector
	readonly regionRef?: RegionReferenceNG;
};

/**
 * @internal
 */
export const ROOT_REGION_REF = "";

export interface LayoutPropsNG {
	/**
	 * View composition that will embedded into the layout.
	 */
	readonly views: ViewNG[];

	readonly regionRef: RegionReferenceNG;

	readonly subRegionRefs?: RegionReferenceNG[];
}

/**
 * Layout specifications
 */
export interface LayoutNG<P extends LayoutPropsNG = LayoutPropsNG> {
	/** The React component for the layout */
	readonly component: ComponentType<P>;
}
