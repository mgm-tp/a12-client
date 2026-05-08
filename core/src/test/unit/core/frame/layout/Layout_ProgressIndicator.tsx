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

import { strictEqual } from "node:assert/strict";

import { act } from "react";

import { type RenderResult } from "@com.mgmtp.a12.devtools/react";

import type { LayoutProps } from "../../../../../core/frame/internal/layout/LayoutProps.js";
import type { ApplicationModel } from "../../../../../core/model/index.js";
import { errorBoundaryProviderMock } from "../../../../mocks/frame/ErrorBoundaryProviderMock.js";
import LayoutProviderMock from "../../../../mocks/frame/LayoutProviderMock.js";
import { progressComponentProviderMock } from "../../../../mocks/frame/progressComponentFactory.js";
import { regionUiProviderMock } from "../../../../mocks/frame/RegionUiMock.js";
import { modelWithOutSubRegions } from "../../../../mocks/frame/storeMocks.js";
import { viewProviderMock } from "../../../../mocks/frame/viewProvider.js";
import { render, within } from "../../../../utils/rtl/rtl-extension.js";
import { TestWrapper } from "../../../../utils/rtl/testWrapper.js";

import {
	createStoreForTest,
	createViewWithActivity,
	getViewsAndActivities,
	type ViewWithActivity
} from "../utils.js";

/**
 * Reusable test suite for layouts to test the progressComponentProvider prop.
 */
export function describeProgressComponentTestForLayout(
	Layout: React.ComponentType<LayoutProps>,
	settings?: object
): void {
	describe("progressComponentProvider", () => {
		it("renders a progressComponent around a view", async () => {
			const views = [createViewWithActivity("A", "ViewA")];
			const result = await renderRegion(modelWithOutSubRegions, views, settings);
			const progressView = within(result.baseElement).getByDataType("ProgressComponentMock");
			within(progressView).getByText("ViewA");
		});

		it("doesn't renders a progressComponent around a view, if it has handleProgressIndicator set", async () => {
			const views = [createViewWithActivity("CP", "ConditionalProgressView")];
			const result = await renderRegion(modelWithOutSubRegions, views, settings);
			const progressView = within(result.baseElement).queryByDataType("ProgressComponentMock");
			strictEqual(progressView, null);
			within(result.baseElement).getByText("ConditionalProgressView");
		});
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
