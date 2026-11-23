// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
