// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual, strictEqual } from "node:assert/strict";
import { mock } from "node:test";

import { act } from "react";
import type { Store } from "redux";

import { query, within, type RenderResult } from "@com.mgmtp.a12.devtools/react";
import { LayoutGrid } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.view.js";

import { ActivityActions } from "../../../../../core/activity/index.js";
import {
	ModuleRegistryProvider,
	ModuleTestExtensions
} from "../../../../../core/application/index.js";
import type { ClientWidgetMap } from "../../../../../core/ClientWidgetMap.js";
import type {
	DynamicConfiguration,
	DynamicFlow,
	DynamicRegion
} from "../../../../../core/configurationNG/index.js";
import type { LayoutPropsNG } from "../../../../../core/frame/index.js";
import { DashboardLayoutComponentNG } from "../../../../../core/frame/index.js";
import type { ApplicationModel } from "../../../../../core/model/index.js";
import { StoreActions } from "../../../../../core/store/index.js";

import { renderRootRegion, ViewComponent } from "./utils.js";

const dashboardRows: ApplicationModel.Dashboard.Row[] = [
	{ columns: [{ width: { lg: 3 } }, { width: { lg: 9 } }] },
	{ columns: [{ width: { lg: 8 } }, { width: { lg: 4 } }] }
];

function testModule(): DynamicConfiguration {
	function DashboardLayout(props: LayoutPropsNG) {
		return (
			<DashboardLayoutComponentNG
				{...props}
				rows={dashboardRows}
				data-testid="DashboardLayoutComponentNG"
			/>
		);
	}

	const REGIONS: DynamicRegion[] = [{ name: "Dashboard", layout: { component: DashboardLayout } }];
	const FLOWS: DynamicFlow[] = [
		{
			name: "dashboardFlow",
			scenes: [
				{
					name: "dashboardScene",
					matches: descriptor => descriptor.test === "dashboard",
					sceneChange: {
						onEnter: [
							{
								type: "DYNAMIC_ADD_VIEW",
								component: ViewComponent,
								region: "Dashboard"
							}
						]
					}
				}
			]
		}
	];

	return {
		id: "dashboardTest",
		regions: REGIONS,
		flows: FLOWS
	};
}

describe("core.frame.layoutNG", () => {
	let widgetMap: Pick<ClientWidgetMap, "Grid" | "Row" | "Column">;
	let result: RenderResult;
	let store: Store;

	beforeEach(async () => {
		widgetMap = {
			Grid: mock.fn(LayoutGrid.Grid),
			Row: mock.fn(LayoutGrid.Row),
			Column: mock.fn(LayoutGrid.Column)
		};

		({ result, store } = await renderRootRegion("Dashboard", widgetMap));
		await act(() => ModuleRegistryProvider.getInstance().addModule(testModule()));
	});

	afterEach(async () => {
		await act(() => store.dispatch(StoreActions.resetState()));
		await ModuleTestExtensions.reset();
	});

	describe("renders a DashboardLayoutNG", () => {
		it("without views if no activity matches", async () => {
			await act(() =>
				store.dispatch(
					ActivityActions.create({
						activityId: "123",
						activityDescriptor: { unrelated: "" },
						loadingState: "without"
					})
				)
			);

			// why is this not working?
			// const layout = within(result.baseElement).getByDataTestId("DashboardLayoutComponentNG");

			const viewComponents = within(result.baseElement).queryAllByDataTestId("ViewComponent");
			strictEqual(viewComponents.length, 0);
		});

		it("with views for all matching activities according to the settings", async () => {
			await act(() => {
				dashboardRows.forEach((row, r) => {
					row.columns.forEach((_, c) => {
						store.dispatch(
							ActivityActions.create({
								activityId: `DashboardActivity-${r}-${c}`,
								activityDescriptor: { test: "dashboard" },
								loadingState: "without"
							})
						);
					});
				});
			});

			const grid = within(result.baseElement).getByDataRole("layout-grid");

			const rows = within(grid).getAllByDataRole("layout-grid-row");
			strictEqual(rows.length, dashboardRows.length);

			const columnRenderings = query(widgetMap.Column).propsHistory();

			rows.forEach((row, r) => {
				const cols = within(row).getAllByDataRole("layout-grid-column");

				strictEqual(cols.length, dashboardRows[r].columns.length);

				cols.forEach((col, c) => {
					deepStrictEqual(columnRenderings[r * 2 + c].size, dashboardRows[r].columns[c].width);
					const viewComponent = within(col).getByDataTestId("ViewComponent");
					strictEqual(viewComponent.dataset.activityid, `DashboardActivity-${r}-${c}`);
				});
			});
		});
	});
});
