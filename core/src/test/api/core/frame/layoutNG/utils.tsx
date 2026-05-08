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
