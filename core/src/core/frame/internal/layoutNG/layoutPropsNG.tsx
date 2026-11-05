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
 * The extra props a region layout is given through `componentProps`.
 *
 * Any plain data is allowed. The props the core sets itself
 * ({@link LayoutPropsNG}) are not: the core always wins, so passing one here
 * would do nothing. They are rejected instead of being ignored quietly.
 */
export type ContributedLayoutProps = Record<string, unknown> &
	Partial<Record<keyof LayoutPropsNG, never>>;

/**
 * Layout specifications
 */
export interface LayoutNG<P extends LayoutPropsNG = LayoutPropsNG> {
	/** The React component for the layout */
	readonly component: ComponentType<P>;

	/**
	 * Additional props passed to the layout {@link LayoutNG.component}.
	 *
	 * Must be plain, serializable data: it is deep-compared like all contributed
	 * configuration, so values may be rebuilt on every selector run without causing
	 * re-renders. This makes it the way to bind state-derived context to a layout —
	 * keep the component itself a module-level constant instead of creating a
	 * closure inside the selector, which would remount the layout on every state change.
	 *
	 * See {@link ContributedLayoutProps}.
	 */
	readonly componentProps?: ContributedLayoutProps;
}
