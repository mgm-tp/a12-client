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

import { equal, ok } from "node:assert/strict";
import { mock } from "node:test";

import { act, type JSX } from "react";
import { Provider } from "react-redux";
import type { Store } from "redux";
import { ThemeProvider } from "styled-components";

import { render, within, type RenderResult } from "@com.mgmtp.a12.devtools/react";
import { DataRoles, getBaseTheme } from "@com.mgmtp.a12.widgets/widgets-core";

import { ErrorBoundary } from "../../../../core/frame/internal/components/error-boundary/ErrorBoundary.js";
import type { View } from "../../../../core/view/index.js";
import { createStoreForTest } from "../../../unit/core/frame/utils.js";

import { describeAppFrameLayoutTests } from "./layouts/applicationFrameLayout.test.js";
import { describeDashboardLayoutTests } from "./layouts/dashboardLayout.test.js";
import { describeMasterDetailRegionLayoutTests } from "./layouts/masterDetailRegionLayout.test.js";
import { describeNullRegionLayoutTests } from "./layouts/nullRegionLayout.test.js";
import { describeStackRegionLayoutTests } from "./layouts/stackRegionLayout.test.js";

describe("core.frame.FrameViews", () => {
	describe("ApplicationFrameLayout", describeAppFrameLayoutTests);

	describe("DashboardLayout", describeDashboardLayoutTests);

	describe("MasterDetailRegionLayout", describeMasterDetailRegionLayoutTests);

	describe("NullRegionLayout", describeNullRegionLayoutTests);

	describe("StackRegionLayout", describeStackRegionLayoutTests);

	describe("ErrorBoundary", () => {
		beforeEach(() => {
			// supress stacktraces of default component
			mock.method(console, "error", () => undefined);
		});

		describe("Given no custom fallback component", () => {
			it("renders the default fallback component", async () => {
				const result = await act(() =>
					renderErrorBoundary(createStoreForTest({}), {
						activityId: "A"
					})
				);

				const title = within(result.baseElement).getByDataRole(DataRoles.Contentbox.Title);

				equal(
					title.textContent,
					"Oops! An error occurred!",
					"Expected the default fallback component to be rendered"
				);
			});

			it("hands the aria-level of the error boundary to the default fallback component", async () => {
				const result = await act(() =>
					renderErrorBoundary(createStoreForTest({}), {
						activityId: "A",
						ariaLevel: 1
					})
				);

				const title = within(result.baseElement).getByDataRole(DataRoles.Contentbox.Title);

				equal(title.ariaLevel, "1", "Expected same aria-level on boundary and fallback component.");
			});
		});

		describe("Given a custom fallback component", () => {
			function CustomFallbackComponent(
				props: View.ErrorBoundaryProvider.FallbackComponentProps
			): JSX.Element {
				return <div aria-level={props.ariaLevel}>Custom Fallback</div>;
			}

			it("renders the given component as its fallback component", async () => {
				const result = await act(() =>
					renderErrorBoundary(createStoreForTest({}), {
						activityId: "A",
						FallbackComponent: CustomFallbackComponent
					})
				);

				const customElement = within(result.baseElement).queryByText("Custom Fallback");

				ok(customElement, "Expected the custom fallback component to be rendered");
			});

			it("hands the aria-level of the error boundary to the custom fallback component", async () => {
				const result = await act(() =>
					renderErrorBoundary(createStoreForTest({}), {
						activityId: "A",
						ariaLevel: 1,
						FallbackComponent: CustomFallbackComponent
					})
				);

				const customElement = within(result.baseElement).getByText("Custom Fallback");

				equal(
					customElement.ariaLevel,
					"1",
					"Expected same aria-level on boundary and fallback component."
				);
			});
		});

		function renderErrorBoundary(
			store: Store<object>,
			props: View.ErrorBoundaryProvider.PropsType
		): RenderResult {
			function RaiseError(): JSX.Element {
				throw new Error("Harhar");
			}

			return render(
				<ThemeProvider theme={getBaseTheme()}>
					<Provider store={store}>
						<ErrorBoundary {...props}>
							<RaiseError />
						</ErrorBoundary>
					</Provider>
				</ThemeProvider>
			);
		}
	});
});
