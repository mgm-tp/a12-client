// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useSelector } from "react-redux";

import { ViewSelectors } from "../../../view/index.js";

import type { RegionUiProps } from "./LayoutProps.js";

/** @internal */
export function DefaultRegionUi(props: RegionUiProps): JSX.Element {
	const region = useSelector(ViewSelectors.region(props.regionReference));
	const Layout = props.layoutProvider(region.layout.name);
	return (
		<Layout.component
			regionReference={props.regionReference}
			settings={region.layout.settings}
			layoutProvider={props.layoutProvider}
			regionUiProvider={props.regionUiProvider}
			viewProvider={props.viewProvider}
			views={region.views}
			progressComponentProvider={props.progressComponentProvider}
			errorBoundaryProvider={props.errorBoundaryProvider}
		/>
	);
}

DefaultRegionUi.whyDidYouRender = true;
