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

import { mock } from "node:test";

import { render } from "@testing-library/react";
import { act } from "react";

import { query } from "@com.mgmtp.a12.devtools/react";
import { ProgressIndicator } from "@com.mgmtp.a12.widgets/widgets-core";

import { DefaultProgressComponentProvider } from "../../../../../core/frame/internal/components/DefaultProgressComponentProvider.js";
import { modelWithSubRegions } from "../../../../mocks/frame/storeMocks.js";
import { createActivity } from "../../../../utils/activity.js";
import { TestWrapper } from "../../../../utils/rtl/testWrapper.js";

import { createStoreForTest } from "../utils.js";

describe("core.frame.internal.components.ProgressComponent", () => {
	describe("given a busy activity and a set of child components", () => {
		it("renders a progress indicator", async () => {
			const { ProgressIndicatorSpy } = await renderProgressIndicator();
			query(ProgressIndicatorSpy).assertRendered();
		});

		it("renders a progress indicator wrapping the child components", async () => {
			const { ChildDummy } = await renderProgressIndicator();
			query(ChildDummy).assertRendered();
		});
	});

	describe("given a non-busy activity and a set of child components", () => {
		it("doesn't render a progress indicator", async () => {
			const { ProgressIndicatorSpy } = await renderProgressIndicator(false);
			query(ProgressIndicatorSpy).assertNotRendered();
		});

		it("renders only the child components", async () => {
			const { ChildDummy } = await renderProgressIndicator(false);
			query(ChildDummy).assertRendered();
		});
	});

	async function renderProgressIndicator(busy = true) {
		const ChildDummy = mock.fn(() => <div />);
		const ProgressIndicatorSpy = mock.fn(ProgressIndicator);

		const store = createStoreForTest({
			appModel: modelWithSubRegions,
			initialState: {
				activities: {
					A: createActivity({
						id: "A",
						activityDataHolder: { busy }
					})
				}
			}
		});

		const ProgressComponent = DefaultProgressComponentProvider();

		const result = await act(() =>
			render(
				<TestWrapper store={store} customWidgetMap={{ ProgressIndicator: ProgressIndicatorSpy }}>
					<ProgressComponent activityId="A">
						<ChildDummy />
					</ProgressComponent>
				</TestWrapper>
			)
		);

		return {
			result,
			ProgressIndicatorSpy,
			ChildDummy
		};
	}
});
