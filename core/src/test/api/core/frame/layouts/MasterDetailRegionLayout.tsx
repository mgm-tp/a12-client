// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
						// TODO: Remove with A12-17777
						// oxlint-disable-next-line typescript/no-deprecated
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
