// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { act } from "react";

import type { LayoutProps } from "../../../../../core/frame/internal/layout/LayoutProps.js";
import type { ApplicationModel } from "../../../../../core/model/index.js";
import { errorBoundaryProviderMock } from "../../../../mocks/frame/ErrorBoundaryProviderMock.js";
import LayoutProviderMock from "../../../../mocks/frame/LayoutProviderMock.js";
import { progressComponentProviderMock } from "../../../../mocks/frame/progressComponentFactory.js";
import { regionUiProviderMock } from "../../../../mocks/frame/RegionUiMock.js";
import { modelWithOutSubRegions } from "../../../../mocks/frame/storeMocks.js";
import { viewProviderMock } from "../../../../mocks/frame/viewProvider.js";
import { render, within, type RenderResult } from "../../../../utils/rtl/rtl-extension.js";
import { TestWrapper } from "../../../../utils/rtl/testWrapper.js";

import {
	createStoreForTest,
	createViewWithActivity,
	getViewsAndActivities,
	type ViewWithActivity
} from "../utils.js";

/**
 * Reusable test suite for layouts to test the errorBoundaryProvider prop.
 */
export function describeErrorBoundaryTestForLayout(
	Layout: React.ComponentType<LayoutProps>,
	settings?: object
): void {
	it("renders an error boundary around a view", async () => {
		const views = [createViewWithActivity("A", "ViewA")];
		const result = await renderRegion(modelWithOutSubRegions, views, settings);
		const errorBoundary = within(result.baseElement).getByDataType("ErrorBoundaryMock");
		within(errorBoundary).getByText("ViewA");
	});

	function renderRegion(
		appModel: ApplicationModel,
		viewsWithActivity: ViewWithActivity[],
		settings?: object
	): Promise<RenderResult> {
		const { views, activities } = getViewsAndActivities(viewsWithActivity);

		const store = createStoreForTest({ appModel: appModel, initialState: { activities } });

		return act(() =>
			render(
				<TestWrapper store={store}>
					<Layout
						regionReference={[]}
						layoutProvider={LayoutProviderMock}
						regionUiProvider={regionUiProviderMock}
						viewProvider={viewProviderMock}
						progressComponentProvider={progressComponentProviderMock}
						errorBoundaryProvider={errorBoundaryProviderMock}
						views={views}
						settings={settings}
					/>
				</TestWrapper>
			)
		);
	}
}
