// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ReactNode } from "react";

import type { LayoutNG, LayoutPropsNG } from "../layoutPropsNG.js";

/**
 * RegionLayout that renders all views "on top" of each other, i.e. only the uppermost view is visible.
 */
function StackRegionLayoutComponentNG(props: LayoutPropsNG): ReactNode {
	const { views, subRegionRefs } = props;

	if (subRegionRefs && subRegionRefs.length > 0) {
		throw new Error("sub-regions are not supported");
	}

	const topView = views.at(-1);

	return topView ? <topView.Component {...topView.props} /> : null;
}

StackRegionLayoutComponentNG.whyDidYouRender = true;

/**
 * @experimental
 * A layout that only ever renders its first view.
 * Should only be used with `DynamicConfiguration`.
 */
export const StackRegionLayoutNG: LayoutNG = {
	component: StackRegionLayoutComponentNG
};
