/*
 * SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
 *
 * Copyright (c) 2012-2026 mgm technology partners GmbH
 *
 * Dual License
 * ------------
 * This source file is part of the mgm A12 Platform and available under
 * a choice of two different licenses:
 *
 * 1. Open-Source License – EUPL v1.2
 *    You may redistribute and/or modify this file under the terms of the
 *    European Union Public License, version 1.2 - see https://eupl.eu/.
 *
 * 2. Commercial License
 *    Alternatively, you may obtain a commercial license from
 *    mgm technology partners GmbH, that permits use of this software
 *    under different terms (including support and maintenance services).
 *
 *    Please contact a12-license@mgm-tp.com for more information.
 *
 * You must select and comply with exactly one of the above license options.
 *
 * Warranty Disclaimer (applies to either option)
 * ----------------------------------------------
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import { ok, strictEqual } from "node:assert/strict";

import { within } from "@com.mgmtp.a12.devtools/react";

import type { FrameViews } from "../../../../../core/frame/index.js";
import MasterDetailRegionLayout from "../../../../../core/frame/internal/layout/MasterDetailRegionLayout.js";
import { createStoreForTest } from "../../../../unit/core/frame/utils.js";

import { describeErrorBoundaryTestWithTwoViews } from "./error_boundary_two_views_test.js";
import { activity, defaultProps, renderLayout } from "./helpers.js";

export function describeMasterDetailRegionLayoutTests(): void {
	describeErrorBoundaryTestWithTwoViews(MasterDetailRegionLayout.component);

	describe("given a widgetMap", () => {
		describe("that contains a masterDetail component", () => {
			it("uses the provided component instead of the default widget", async () => {
				const store = createStoreForTest({});

				function CustomMasterDetail() {
					return <span data-testid="CustomMasterDetail">peace</span>;
				}

				const { baseElement } = await renderLayout<FrameViews.MasterDetailLayoutProps>(
					store,
					{
						...defaultProps,
						widgetMap: {
							masterDetail: CustomMasterDetail
						}
					},
					MasterDetailRegionLayout.component,
					activity
				);

				const custom = within(baseElement).queryByDataTestId("CustomMasterDetail");
				const masterDetail = within(baseElement).queryByDataTestId("MasterDetail");

				ok(custom, "Expected the custom master detail component to be rendered");
				strictEqual(masterDetail, null, "Expected the default MasterDetail not to be rendered");
			});
		});
	});
}
