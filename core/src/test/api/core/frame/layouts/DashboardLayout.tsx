// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import DashboardLayout from "../../../../../core/frame/internal/layout/DashboardLayout.js";
import { dashboardSettingsMock } from "../../../../mocks/frame/storeMocks.js";

import { describeErrorBoundaryTestWithTwoViews as describeLayoutErrorBoundaryTestWithTwoViews } from "./error_boundary_two_views_test.js";

export function describeDashboardLayoutTests(): void {
	describeLayoutErrorBoundaryTestWithTwoViews(DashboardLayout.component, dashboardSettingsMock);
}
