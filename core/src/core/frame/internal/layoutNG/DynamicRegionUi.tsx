// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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

	return <layout.component views={views} regionRef={regionRef} subRegionRefs={subRegionRefs} />;
}

DynamicRegionUi.whyDidYouRender = true;
