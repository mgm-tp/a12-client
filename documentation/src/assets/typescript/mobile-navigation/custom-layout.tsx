// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

// tag::content[]

import type { FrameViews } from "@com.mgmtp.a12.client/client-core";

import { CustomLayoutComponent } from "./CustomLayoutComponent.js";

export const layout: FrameViews.Layout = {
	component: CustomLayoutComponent,
	visibleViews: "single",
	getClearedAfterViewIndex(layoutProps: FrameViews.LayoutProps) {
		return () => {
			if (layoutProps.views.length > 1) {
				return layoutProps.views.length - 2;
			}

			return undefined;
		};
	}
};
// end::content[]
