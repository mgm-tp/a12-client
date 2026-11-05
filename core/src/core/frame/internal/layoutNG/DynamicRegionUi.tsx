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

import { useSelector } from "react-redux";

import { DynamicModelSelectors } from "../../../configurationNG/internal/dynamicSelectors.js";

import type { RegionUiPropsNG } from "./layoutPropsNG.js";
import { ROOT_REGION_REF } from "./layoutPropsNG.js";

/**
 * @experimental
 *
 * The "entry point" for the new API
 *
 * Rendering the client app will look like this:
 *
 * ... render code
 *
 * ```tsx
 * <DynamicRegionUi />
 *
 * <DynamicRegionUi regionRef="otherRegion" />
 * ```
 *
 * NOTE: Not passing a `regionRef` is considered the entry point,
 * aka the "root region". This should only happen once in your application.
 */
export function DynamicRegionUi(props: RegionUiPropsNG) {
	const regionRef = props.regionRef ?? ROOT_REGION_REF;

	const { layout, views } = useSelector(DynamicModelSelectors.dynamicRegionInfo(regionRef));
	const subRegionRefs = useSelector(DynamicModelSelectors.dynamicSubRegionRefs(regionRef));

	return (
		<layout.component
			{...layout.componentProps}
			views={views}
			regionRef={regionRef}
			subRegionRefs={subRegionRefs}
		/>
	);
}

DynamicRegionUi.whyDidYouRender = true;
