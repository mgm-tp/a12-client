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

import { render } from "@testing-library/react";

import { query } from "@com.mgmtp.a12.devtools/react";

import NullRegionLayout from "../../../../core/frame/internal/layout/NullRegionLayout.js";
import type { ApplicationModel } from "../../../../core/model/index.js";
import { errorBoundaryProviderMock } from "../../../mocks/frame/ErrorBoundaryProviderMock.js";
import LayoutProviderMock from "../../../mocks/frame/LayoutProviderMock.js";
import { progressComponentProviderMock } from "../../../mocks/frame/progressComponentFactory.js";
import { regionUiProviderMock } from "../../../mocks/frame/RegionUiMock.js";
import {
	modelWithOutSubRegions,
	modelWithSubRegionsAndMockLayout
} from "../../../mocks/frame/storeMocks.js";
import { ViewProviderWithNodeMocks } from "../../../mocks/frame/viewProvider.js";
import { within } from "../../../utils/rtl/rtl-extension.js";
import { TestWrapper } from "../../../utils/rtl/testWrapper.js";

import { describeErrorBoundaryTestForLayout } from "./layout/Layout_ErrorBoundary.js";
import { describeProgressComponentTestForLayout } from "./layout/Layout_ProgressIndicator.js";
import type { ViewWithActivity } from "./utils.js";
import { createStoreForTest, createViewWithActivity, getViewsAndActivities } from "./utils.js";

describe("core.frame.internal.layout.NullRegionLayout", () => {
	describe("Rendering", () => {
		let views: ViewWithActivity[];
		before(() => {
			views = [
				createViewWithActivity("A", "SampleComponent"),
				createViewWithActivity("B", "SampleComponent"),
				createViewWithActivity("C", "SampleComponent")
			];
		});

		describe("given a region reference having sub regions", () => {
			it("renders a layout with all sub regions in the given order and no views", () => {
				const { result } = renderRegion(modelWithSubRegionsAndMockLayout, views);

				const regions = within(result.baseElement).getAllByDataType("RegionUiMock");
				strictEqual(regions.length, 3, "Expected to find three sub regions");

				const viewComponents = within(result.baseElement).queryAllByText("SampleComponent");
				strictEqual(viewComponents.length, 0, "Views should not be rendered");

				const firstRegion = regions.at(0);
				const secondRegion = regions.at(1);
				const thirdRegion = regions.at(2);

				deepStrictEqual(
					firstRegion?.dataset.name,
					"CONTENT",
					"Expected first region to be content region"
				);
				deepStrictEqual(
					secondRegion?.dataset.name,
					"SIDEBAR",
					"Expected second region to be sidebar region"
				);
				deepStrictEqual(
					thirdRegion?.dataset.name,
					"MODAL",
					"Expected third region to be modal region"
				);
			});
		});

		describe("given a region reference without sub regions", () => {
			it("renders a layout with all views in the given order", () => {
				const { SampleComponent } = renderRegion(modelWithOutSubRegions, views);
				const viewComponents = query(SampleComponent).propsHistory();

				strictEqual(viewComponents.length, 3, "Expected to find three SampleComponents");

				const viewA = viewComponents[0];
				const viewB = viewComponents[1];
				const viewC = viewComponents[2];

				strictEqual(viewA.activityId, "A", "Expected first view to be view of activity A");
				strictEqual(viewB.activityId, "B", "Expected second view to be view of activity B");
				strictEqual(viewC.activityId, "C", "Expected third view to be view of activity C");
			});

			it("renders no layout, when there is no view and no sub region", () => {
				const { SampleComponent } = renderRegion(modelWithOutSubRegions, []);
				query(SampleComponent).assertNotRendered();
			});
		});
	});

	describeProgressComponentTestForLayout(NullRegionLayout.component);
	describeErrorBoundaryTestForLayout(NullRegionLayout.component);
});

function renderRegion(appModel: ApplicationModel, viewsWithActivity: ViewWithActivity[]) {
	const { views, activities } = getViewsAndActivities(viewsWithActivity);

	const store = createStoreForTest({ appModel: appModel, initialState: { activities } });

	const viewProvider = ViewProviderWithNodeMocks();
	const SampleComponent = viewProvider("SampleComponent");

	const result = render(
		<TestWrapper store={store}>
			<NullRegionLayout.component
				regionReference={[]}
				layoutProvider={LayoutProviderMock}
				regionUiProvider={regionUiProviderMock}
				viewProvider={viewProvider}
				progressComponentProvider={progressComponentProviderMock}
				errorBoundaryProvider={errorBoundaryProviderMock}
				views={views}
			/>
		</TestWrapper>
	);

	return {
		result,
		SampleComponent
	};
}
