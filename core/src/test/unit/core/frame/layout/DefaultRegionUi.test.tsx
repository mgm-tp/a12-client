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

import { query } from "@com.mgmtp.a12.devtools/react";

import { DefaultRegionUi } from "../../../../../core/frame/internal/layout/DefaultRegionUi.js";
import type {
	LayoutProps,
	LayoutProvider
} from "../../../../../core/frame/internal/layout/LayoutProps.js";
import type { ApplicationModel } from "../../../../../core/model/index.js";
import { progressComponentProviderMock } from "../../../../mocks/frame/progressComponentFactory.js";
import { regionUiProviderMock } from "../../../../mocks/frame/RegionUiMock.js";
import { modelWithSubRegions } from "../../../../mocks/frame/storeMocks.js";
import { viewProviderMock } from "../../../../mocks/frame/viewProvider.js";
import { render } from "../../../../utils/rtl/rtl-extension.js";
import { TestWrapper } from "../../../../utils/rtl/testWrapper.js";

import { createStoreForTest } from "../utils.js";

const MOCK_LAYOUT_NAME = "Mock";

describe("core.frame.internal.layout.DefaultRegionUi", () => {
	it("renders the expected layout with the correct props", () => {
		const { DefaultRegionUiSpy, LayoutProviderSpy } = renderDefaultRegionUi();

		const regionProps = query(DefaultRegionUiSpy).props();
		strictEqual(regionProps.layoutProvider, LayoutProviderSpy);
		strictEqual(regionProps.regionUiProvider, regionUiProviderMock);
		strictEqual(regionProps.viewProvider, viewProviderMock);
		deepStrictEqual(regionProps.regionReference, []);

		const layoutProps = query(LayoutProviderSpy(MOCK_LAYOUT_NAME).component).props();
		deepStrictEqual(layoutProps.views, []);
	});
});

// setup some spys and render the DefaultRegionUi
function renderDefaultRegionUi() {
	const DefaultRegionUiSpy = mock.fn(DefaultRegionUi);
	const LayoutProviderSpy = SingleLayoutProvider(MOCK_LAYOUT_NAME, mock.fn());
	const result = render(
		<TestWrapper store={testStore()}>
			<DefaultRegionUiSpy
				regionReference={[]}
				layoutProvider={LayoutProviderSpy}
				regionUiProvider={regionUiProviderMock}
				viewProvider={viewProviderMock}
				progressComponentProvider={progressComponentProviderMock}
			/>
		</TestWrapper>
	);
	return { result, DefaultRegionUiSpy, LayoutProviderSpy };
}

// modelWithSubRegions with a layout MOCK_LAYOUT_NAME for the content.region
function testStore() {
	const appModel: ApplicationModel = {
		...modelWithSubRegions,
		content: {
			...modelWithSubRegions.content,
			region: {
				...modelWithSubRegions.content.region,
				layout: { name: MOCK_LAYOUT_NAME }
			}
		}
	};

	return createStoreForTest({ appModel });
}

// a LayoutProvider that knows only one layout with the given name and component
function SingleLayoutProvider(
	name: string,
	component: React.ComponentType<LayoutProps>
): LayoutProvider {
	return function (layoutName: string) {
		if (layoutName === name) {
			return { component };
		}
		throw new Error("unknown layout " + layoutName);
	};
}
