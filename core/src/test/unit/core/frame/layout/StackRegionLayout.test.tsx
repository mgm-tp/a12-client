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

import { strictEqual, throws } from "node:assert/strict";
import { mock } from "node:test";

import type { Store } from "redux";

import { query } from "@com.mgmtp.a12.devtools/react";

import StackRegionLayout from "../../../../../core/frame/internal/layout/StackRegionLayout.js";
import type { View } from "../../../../../core/view/index.js";
import LayoutProviderMock from "../../../../mocks/frame/LayoutProviderMock.js";
import { regionUiProviderMock } from "../../../../mocks/frame/RegionUiMock.js";
import { progressComponentProviderMock } from "../../../../mocks/frame/progressComponentFactory.js";
import {
	modelWithOutSubRegions,
	modelWithSubRegionsAndMockLayout
} from "../../../../mocks/frame/storeMocks.js";
import { ViewProviderWithNodeMocks } from "../../../../mocks/frame/viewProvider.js";
import { render, within } from "../../../../utils/rtl/rtl-extension.js";
import { TestWrapper } from "../../../../utils/rtl/testWrapper.js";

import { createStoreForTest, createViewWithActivity, getViewsAndActivities } from "../utils.js";

import { describeErrorBoundaryTestForLayout } from "./Layout_ErrorBoundary.js";
import { describeProgressComponentTestForLayout } from "./Layout_ProgressIndicator.js";

describe("core.frame.internal.layout.StackRegionLayout", () => {
	describe("Rendering", () => {
		it("renders a layout with a SampleComponent, when there is one view", () => {
			const { views, activities } = getViewsAndActivities([createViewWithActivity("A", "ViewA")]);

			const { result, StackRegionLayoutSpy } = renderComponent(
				createStoreForTest({ appModel: modelWithOutSubRegions, initialState: { activities } }),
				views
			);
			query(StackRegionLayoutSpy).assertRendered();
			within(result.baseElement).getByText("ViewA");
		});

		it("renders a layout with the latest view, when there are multiple views", () => {
			const { views, activities } = getViewsAndActivities([
				createViewWithActivity("A", "ViewA"),
				createViewWithActivity("B", "ViewB"),
				createViewWithActivity("C", "ViewC")
			]);

			const { result, StackRegionLayoutSpy } = renderComponent(
				createStoreForTest({ appModel: modelWithOutSubRegions, initialState: { activities } }),
				views
			);
			query(StackRegionLayoutSpy).assertRendered();
			within(result.baseElement).getByText("ViewC");
		});

		it("renders nothing, when there is no view", () => {
			const { StackRegionLayoutSpy } = renderComponent(
				createStoreForTest({ appModel: modelWithOutSubRegions }),
				[]
			);
			strictEqual(StackRegionLayoutSpy.mock.calls.length, 1);
			strictEqual(StackRegionLayoutSpy.mock.calls[0].result, null);
		});
	});

	describe("Error", () => {
		it("throws an error, when there are subRegions in the appModel", () => {
			const { views, activities } = getViewsAndActivities([
				createViewWithActivity("A", "SampleComponent")
			]);

			throws(
				() =>
					renderComponent(
						createStoreForTest({
							appModel: modelWithSubRegionsAndMockLayout,
							initialState: { activities }
						}),
						views
					),
				new Error("sub-regions are not supported")
			);
		});
	});

	describeProgressComponentTestForLayout(StackRegionLayout.component);

	describeErrorBoundaryTestForLayout(StackRegionLayout.component);

	describe("Accessibility", () => {
		it("hands aria-level 1 to the visible view of the stack", () => {
			const { views, activities } = getViewsAndActivities([
				createViewWithActivity("A", "SampleComponent"),
				createViewWithActivity("B", "SampleComponent")
			]);

			const { viewProvider } = renderComponent(
				createStoreForTest({ appModel: modelWithOutSubRegions, initialState: { activities } }),
				views
			);
			const SampleComponent = query(viewProvider("SampleComponent")).props();

			strictEqual(SampleComponent.ariaLevel, 1, "Expected aria-level to be 1.");
		});
	});
});

function renderComponent(store: Store<object>, views: View[]) {
	const rootRegionRef: string[] = [];

	const StackRegionLayoutSpy = mock.fn(StackRegionLayout.component);

	const viewProvider = ViewProviderWithNodeMocks();

	const result = render(
		<TestWrapper store={store}>
			<StackRegionLayoutSpy
				regionReference={rootRegionRef}
				layoutProvider={LayoutProviderMock}
				regionUiProvider={regionUiProviderMock}
				viewProvider={viewProvider}
				progressComponentProvider={progressComponentProviderMock}
				views={views}
			/>
		</TestWrapper>
	);
	return {
		result,
		StackRegionLayoutSpy,
		viewProvider
	};
}
