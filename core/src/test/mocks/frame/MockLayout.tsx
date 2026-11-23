// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { useContext } from "react";

import { FrameViews } from "../../../core/frame/index.js";
import type { SidebarContextProps } from "../../../core/frame/internal/layout/ApplicationFrameLayout.js";
import type { Layout } from "../../../core/frame/internal/layout/LayoutProps.js";

/**
 * Function to create a Layout that renders a given spy.
 */

export interface MockRegionLayoutContentProps
	extends FrameViews.LayoutProps, Partial<SidebarContextProps> {}

function mockLayout(ContentComponent: React.ComponentType<MockRegionLayoutContentProps>): Layout {
	return {
		component: function MockLayout(props: FrameViews.LayoutProps) {
			const sidebarContextProps = useContext(FrameViews.SidebarContext);
			return <ContentComponent {...props} {...sidebarContextProps} />;
		}
	};
}

export default mockLayout;
