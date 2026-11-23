// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";

import { DynamicRegionUi } from "../DynamicRegionUi.js";
import type { LayoutNG, LayoutPropsNG } from "../layoutPropsNG.js";

function NullRegionLayoutComponentNG(props: LayoutPropsNG): JSX.Element | null {
	const { views, subRegionRefs } = props;

	if (subRegionRefs?.length) {
		return (
			<>
				{subRegionRefs.map(subRegion => (
					<DynamicRegionUi key={subRegion} regionRef={subRegion} />
				))}
			</>
		);
	} else {
		if (views.length === 0) {
			return null;
		}
		return (
			<>
				{views.map((view, idx) => (
					<view.Component key={`${view.props.activityId}-${idx}`} {...view.props} />
				))}
			</>
		);
	}
}

NullRegionLayoutComponentNG.whyDidYouRender = true;

/**
 * @experimental
 * A layout that simply renders its subregions or views directly.
 * Should only be used with `DynamicConfiguration`.
 */
export const NullRegionLayoutNG: LayoutNG = {
	component: NullRegionLayoutComponentNG
};
