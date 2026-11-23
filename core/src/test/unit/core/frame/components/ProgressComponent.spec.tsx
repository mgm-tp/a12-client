// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { mock } from "node:test";

import { render } from "@testing-library/react";
import { act } from "react";

import { query } from "@com.mgmtp.a12.devtools/react";
import { ProgressIndicator } from "@com.mgmtp.a12.widgets/widgets-core/lib/progress-indicator/main/progress-indicator.view.js";

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
