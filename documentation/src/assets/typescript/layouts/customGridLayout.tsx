// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

// tag::content[]
import type { JSX } from "react";

import type { FrameViews } from "@com.mgmtp.a12.client/client-core";
import { FrameFactories } from "@com.mgmtp.a12.client/client-core";
import { LayoutGrid } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.view.js";

export const customLayoutProvider: FrameViews.LayoutProvider = name => {
	return name === "CustomGridLayout"
		? { component: CustomGridLayout }
		: FrameFactories.layoutProvider(name);
};

function CustomGridLayout(props: FrameViews.LayoutProps): JSX.Element {
	const viewComponents = props.views.map(view => ({
		ViewComponent: props.viewProvider(view.name),
		view
	}));

	return (
		<LayoutGrid.Grid>
			<LayoutGrid.Row>
				{viewComponents.map(({ ViewComponent, view }, index) => (
					<ViewComponent key={`${view.name}-${view.activityId}-${index}`} {...view} />
				))}
			</LayoutGrid.Row>
		</LayoutGrid.Grid>
	);
}
// end::content[]
