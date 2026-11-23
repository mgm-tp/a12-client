// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import NullRegionLayout from "../../../../../core/frame/internal/layout/NullRegionLayout.js";

import { describeErrorBoundaryTestWithTwoViews } from "./error_boundary_two_views_test.js";

export function describeNullRegionLayoutTests(): void {
	describeErrorBoundaryTestWithTwoViews(NullRegionLayout.component);
}
