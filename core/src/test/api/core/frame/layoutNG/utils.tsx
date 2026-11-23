// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { act } from "react";
import type { Store } from "redux";

import { render, type RenderResult } from "@com.mgmtp.a12.devtools/react";

import type { ClientWidgetMap } from "../../../../../core/ClientWidgetMap.js";
import type { LayoutPropsNG, RegionReferenceNG } from "../../../../../core/frame/index.js";
import { DynamicRegionUi, NullRegionLayoutNG } from "../../../../../core/frame/index.js";
import type { ViewNGProps } from "../../../../../core/view/internal/viewNG.js";
import { TestWrapper } from "../../../../utils/rtl/testWrapper.js";
import { createApplicationSetup } from "../../../../utils/test-utils.js";

export const ContentMock = MockLayout("ContentMock");
export const SidebarMock = MockLayout("SidebarMock");
export const ModalMock = MockLayout("ModalMock");

function MockLayout(testId: string): React.FC<LayoutPropsNG> {
	return function MockLayoutComponent(props: LayoutPropsNG): React.ReactNode {
		return (
			<div data-testid={testId}>
				<NullRegionLayoutNG.component {...props} />
			</div>
		);
	};
}

export function ViewComponent(props: ViewNGProps): React.ReactNode {
	return <span data-testid="ViewComponent" data-activityid={props.activityId} />;
}

export async function renderRootRegion(
	ref?: RegionReferenceNG,
	customWidgetMap?: Partial<ClientWidgetMap>
): Promise<{
	readonly result: RenderResult;
	readonly store: Store;
}> {
	const { store } = createApplicationSetup();

	const wrapper = await act(() =>
		render(
			<TestWrapper store={store} customWidgetMap={customWidgetMap}>
				<DynamicRegionUi regionRef={ref} />
			</TestWrapper>
		)
	);

	return { result: wrapper, store };
}
