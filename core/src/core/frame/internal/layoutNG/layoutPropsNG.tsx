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
