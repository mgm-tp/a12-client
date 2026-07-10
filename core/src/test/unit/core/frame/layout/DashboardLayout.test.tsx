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
 * 1. Open-Source License - EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED "AS IS" AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import { deepStrictEqual, strictEqual } from "node:assert/strict";
import { mock } from "node:test";

import { act } from "react";
import type { Store } from "redux";

import { query } from "@com.mgmtp.a12.devtools/react";
import { LayoutGrid } from "@com.mgmtp.a12.widgets/widgets-core";

import { assertObject } from "../../../../../core/assertion.js";
import DashboardLayout from "../../../../../core/frame/internal/layout/DashboardLayout.js";
import type { ApplicationModel } from "../../../../../core/model/index.js";
import type { View } from "../../../../../core/view/index.js";
import LayoutProviderMock from "../../../../mocks/frame/LayoutProviderMock.js";
import { progressComponentProviderMock } from "../../../../mocks/frame/progressComponentFactory.js";
import { regionUiProviderMock } from "../../../../mocks/frame/RegionUiMock.js";
import { modelWithOutSubRegions } from "../../../../mocks/frame/storeMocks.js";
import { ViewProviderWithNodeMocks } from "../../../../mocks/frame/viewProvider.js";
import { render, screen, within } from "../../../../utils/rtl/rtl-extension.js";
import { TestWrapper } from "../../../../utils/rtl/testWrapper.js";

import { createStoreForTest, createViewWithActivity, getViewsAndActivities } from "../utils.js";

import { describeErrorBoundaryTestForLayout } from "./Layout_ErrorBoundary.js";
import { describeProgressComponentTestForLayout } from "./Layout_ProgressIndicator.js";

describe("core.frame.internal.layout.DashboardLayout", () => {
	describe("Rendering", () => {
		describe("Render DashboardLayout with two rows", () => {
			function renderDashboard() {
				const { views, activities } = getViewsAndActivities([
					createViewWithActivity("A", "ViewA"),
					createViewWithActivity("B", "ViewB"),
					createViewWithActivity("C", "ViewC")
				]);

				const settings: ApplicationModel.Dashboard.Settings = {
					rows: [
						{
							columns: [
								{
									width: { sm: 1, md: 1, lg: 1 }
								},
								{
									width: { sm: 2, md: 2, lg: 2 }
								}
							]
						},
						{
							columns: [
								{
									width: { sm: 3, md: 3, lg: 3 }
								}
							]
						}
					]
				};

				return mountComponent(
					createStoreForTest({ appModel: modelWithOutSubRegions, initialState: { activities } }),
					views,
					settings
				);
			}

			it("renders a layout grid", async () => {
				await renderDashboard();
				screen.getByDataRole("layout-grid");
			});

			it("renders two rows", async () => {
				await renderDashboard();
				strictEqual(
					screen.getAllByDataRole("layout-grid-row").length,
					2,
					"Expected to find two rows"
				);
			});

			describe("where the first row has two columns and the second row has one column", () => {
				it("renders the rows with the correct columns", async () => {
					await renderDashboard();
					const rows = screen.getAllByDataRole("layout-grid-row");
					const [columnsInFirstRow, columnsInSecondRow] = rows.map(row =>
						within(row).getAllByDataRole("layout-grid-column")
					);

					strictEqual(columnsInFirstRow.length, 2, "Expected two columns in first row");
					strictEqual(columnsInSecondRow.length, 1, "Expected one column in second row");
				});

				it("renders the columns with the correct size properties", async () => {
					const { widgetMap } = await renderDashboard();
					const columnRenders = query(widgetMap.Column).propsHistory();

					const columnsInFirstRow = columnRenders.slice(0, 2);
					const columnsInSecondRow = columnRenders.slice(2, 3);

					deepStrictEqual(
						columnsInFirstRow[0].size,
						{ sm: 1, md: 1, lg: 1 },
						"Wrong size properties in tile (0,0)"
					);

					deepStrictEqual(
						columnsInFirstRow[1].size,
						{ sm: 2, md: 2, lg: 2 },
						"Wrong size properties in tile (1,0)"
					);

					deepStrictEqual(
						columnsInSecondRow[0].size,
						{ sm: 3, md: 3, lg: 3 },
						"Wrong size properties in tile (0,1)"
					);
				});

				it("renders the correct ui components in the correct tiles", async () => {
					await renderDashboard();
					const rows = screen.getAllByDataRole("layout-grid-row");
					const [columnsInFirstRow, columnsInSecondRow] = rows.map(row =>
						within(row).getAllByDataRole("layout-grid-column")
					);

					within(columnsInFirstRow[0]).getByText("ViewA");
					within(columnsInFirstRow[1]).getByText("ViewB");
					within(columnsInSecondRow[0]).getByText("ViewC");
				});
			});
		});

		describe("Render DashboardLayout with nested rows and columns", () => {
			function renderDashboard() {
				const { views, activities } = getViewsAndActivities([
					createViewWithActivity("A", "ViewA"),
					createViewWithActivity("B", "ViewB"),
					createViewWithActivity("C", "ViewC")
				]);

				const settings: ApplicationModel.Dashboard.Settings = {
					rows: [
						{
							columns: [
								{
									width: { sm: 1, md: 1, lg: 1 }
								},
								{
									width: { sm: 1, md: 2, lg: 2 },
									rows: [
										{
											columns: [
												{
													width: { sm: 4, md: 4, lg: 4 }
												},
												{
													width: { sm: 4, md: 5, lg: 5 }
												},
												{
													width: { sm: 4, md: 6, lg: 6 }
												}
											]
										},
										{
											columns: [
												{
													width: { sm: 4, md: 6, lg: 7 }
												}
											]
										}
									]
								}
							]
						}
					]
				};

				return mountComponent(
					createStoreForTest({ appModel: modelWithOutSubRegions, initialState: { activities } }),
					views,
					settings
				);
			}

			it("renders the layout correctly", async () => {
				const { widgetMap } = await renderDashboard();

				const result = screen.getByDataRole("layout-grid");

				const row = within(result).getAllByDataRole("layout-grid-row").at(0);

				assertObject(row);

				// row has more than two columns
				const columns = within(row).getAllByDataRole("layout-grid-column");
				strictEqual(columns.length > 1, true);

				const firstColumn = columns[0];
				const rowsInFirstColumn = within(firstColumn).queryAllByDataRole("layout-grid-row");
				strictEqual(rowsInFirstColumn.length, 0, "Expected that first column has no more rows");

				const firstColumnProps = query(widgetMap.Column).propsHistory()[0];
				deepStrictEqual(
					firstColumnProps.size,
					{ sm: 1, md: 1, lg: 1 },
					"Wrong size properties in tile (0,0)"
				);

				const secondColumn = columns[1];
				const rowsInSecondColumn = within(secondColumn).getAllByDataRole("layout-grid-row");

				strictEqual(rowsInSecondColumn.length, 2, "Expected two rows in second column");

				const firstRowInSecondColumn = rowsInSecondColumn[0];
				const nestedColumns = within(firstRowInSecondColumn).getAllByDataRole("layout-grid-column");
				strictEqual(nestedColumns.length, 3, "Expected three nested columns");
			});
		});

		it("Renders no DashboardLayout when there are no views", async () => {
			await mountComponent(createStoreForTest({ appModel: modelWithOutSubRegions }), [], {
				rows: [
					{
						columns: [
							{
								width: { sm: 1, md: 1, lg: 1 }
							},
							{
								width: { sm: 2, md: 2, lg: 2 }
							}
						]
					},
					{
						columns: [
							{
								width: { sm: 3, md: 3, lg: 3 }
							}
						]
					}
				]
			});

			const columns = screen.queryAllByDataRole("layout-grid-column");
			const rows = screen.queryAllByDataRole("layout-grid-row");

			strictEqual(columns.length, 0, "Expected to find no Columns");
			strictEqual(rows.length, 0, "Expected to find no Rows");
		});
	});

	const settingsForOneView: ApplicationModel.Dashboard.Settings = {
		rows: [
			{
				columns: [
					{
						width: { sm: 1, md: 1, lg: 1 }
					}
				]
			}
		]
	};

	describeProgressComponentTestForLayout(DashboardLayout.component, settingsForOneView);

	describeErrorBoundaryTestForLayout(DashboardLayout.component, settingsForOneView);

	describe("Accessibility", () => {
		async function renderDashboard() {
			const { views, activities } = getViewsAndActivities([
				createViewWithActivity("A", "ViewA"),
				createViewWithActivity("B", "ViewB")
			]);
			const settings: ApplicationModel.Dashboard.Settings = {
				rows: [
					{
						columns: [
							{
								width: { sm: 1, md: 1, lg: 1 }
							},
							{
								width: { sm: 2, md: 2, lg: 2 }
							}
						]
					}
				]
			};

			return mountComponent(
				createStoreForTest({ appModel: modelWithOutSubRegions, initialState: { activities } }),
				views,
				settings
			);
		}

		it("renders an unseenButRead heading over the dashboard with aria-level 1", async () => {
			await renderDashboard();

			screen.getByRole("heading", { level: 1, hidden: true });
		});

		it("hands aria-level 2 to each view in a tile", async () => {
			const { viewProvider } = await renderDashboard();
			["ViewA", "ViewB"].forEach(viewName => {
				strictEqual(query(viewProvider(viewName)).props().ariaLevel, 2);
			});
		});
	});
});

async function mountComponent(
	store: Store<object>,
	views: View[],
	settings: ApplicationModel.Dashboard.Settings
) {
	const Layout = mock.fn(DashboardLayout.component);
	const Row = mock.fn(LayoutGrid.Row);
	const Column = mock.fn(LayoutGrid.Column);
	const widgetMap = {
		DashboardLayout: Layout,
		Row,
		Column
	};

	const viewProvider = ViewProviderWithNodeMocks();

	const rootRegionRef: string[] = [];
	await act(() =>
		render(
			<TestWrapper store={store} customWidgetMap={widgetMap}>
				<Layout
					regionReference={rootRegionRef}
					layoutProvider={LayoutProviderMock}
					regionUiProvider={regionUiProviderMock}
					viewProvider={viewProvider}
					progressComponentProvider={progressComponentProviderMock}
					views={views}
					settings={settings}
				/>
			</TestWrapper>
		)
	);
	return {
		widgetMap,
		viewProvider
	};
}
