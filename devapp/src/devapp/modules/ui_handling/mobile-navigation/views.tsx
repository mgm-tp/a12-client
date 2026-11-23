// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { View } from "@com.mgmtp.a12.client/client-core";

import {
	DashboardView,
	MobileNavigationDashboardSidebar,
	StartDashboard
} from "./components/dashboardLayout.js";
import {
	FormEngineSidebar,
	MobileNavigationOverviewEngineSidebar
} from "./components/masterDetailLayout.js";
import { NullRegionSidebar, NullRegionView } from "./components/nullRegionLayout.js";
import { StackLayoutView } from "./components/stackLayout.js";

export default function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

const Views: { [name: string]: View.ViewComponent } = {
	MobileNavigationOverviewEngineSidebar,
	FormEngineSidebar,
	MobileNavDashboard: StartDashboard,
	DashboardView,
	MobileNavigationDashboardSidebar,
	StackLayoutView,
	NullRegionView,
	NullRegionSidebar
};
