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

import { notStrictEqual, strictEqual } from "node:assert/strict";
import type { Mock } from "node:test";
import { mock } from "node:test";

import { render } from "@testing-library/react";
import { act } from "react";
import type { Store } from "redux";

import type { ModalOverlayProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/modal-overlay/main/modal-overlay.api.js";

import { ActivityActions, type ActivityMap } from "../../../../../core/activity/index.js";
import type { ClientWidgetMap } from "../../../../../core/ClientWidgetMap.js";
import type { LayoutProps } from "../../../../../core/frame/internal/layout/LayoutProps.js";
import { ModalRegionUi } from "../../../../../core/frame/internal/layout/ModalRegionUi.js";
import { progressComponentProviderMock } from "../../../../mocks/frame/progressComponentFactory.js";
import { regionUiProviderMock } from "../../../../mocks/frame/RegionUiMock.js";
import { modelForModalRegion } from "../../../../mocks/frame/storeMocks.js";
import { viewProviderMock } from "../../../../mocks/frame/viewProvider.js";
import { createActivity } from "../../../../utils/activity.js";
import { TestWrapper } from "../../../../utils/rtl/testWrapper.js";

import { createStoreForTest } from "../utils.js";

describe("core.frame.internal.layout.ModalRegionUi", () => {
	describe("Rendering", () => {
		function getActivities(): ActivityMap {
			return {
				A: createActivity({
					id: "A",
					descriptor: { page: "ModalRegion" }
				}),
				B: createActivity({
					id: "B",
					initiatingActivityId: "A",
					descriptor: { page: "ModalRegion" }
				})
			};
		}

		it("renders a ModalOverlay, when there is at least one activity which should be rendered in a ModalRegion", async () => {
			const { ModalOverlay } = await mountComponent(
				createStoreForTest({
					appModel: modelForModalRegion,
					initialState: { activities: getActivities() }
				})
			);

			strictEqual(ModalOverlay.mock.callCount(), 1);
		});

		it("renders a ModalOverlay with the expected layout for the Modal Region inside", async () => {
			const { ModalOverlay, LayoutUi } = await mountComponent(
				createStoreForTest({
					appModel: modelForModalRegion,
					initialState: { activities: getActivities() }
				})
			);

			strictEqual(ModalOverlay.mock.callCount(), 1);
			strictEqual(LayoutUi.mock.callCount(), 1);
		});

		it("renders no layout, when there is no activity", async () => {
			const { ModalOverlay } = await mountComponent(
				createStoreForTest({ appModel: modelForModalRegion })
			);

			strictEqual(ModalOverlay.mock.callCount(), 0);
		});

		it("cancels all activities when the modal is closed", async () => {
			const store = createStoreForTest({
				appModel: modelForModalRegion,
				initialState: { activities: getActivities() }
			});
			const { ModalOverlay } = await mountComponent(store);

			strictEqual(ModalOverlay.mock.callCount(), 1);
			const onClose = ModalOverlay.mock.calls[0].arguments[0].onClose;
			notStrictEqual(onClose, undefined);

			await act(onClose!);
			const cancelAction = store.getActions().find(ActivityActions.cancelRequested.match);
			notStrictEqual(cancelAction, undefined);
		});
	});
});

type Result = {
	ModalOverlay: Mock<(props: ModalOverlayProps) => unknown>;
	LayoutUi: Mock<(props: LayoutProps) => unknown>;
};

async function mountComponent(store: Store<object>): Promise<Result> {
	const rootRegionRef: string[] = ["MODAL"];
	const ModalOverlay = mock.fn((props: ModalOverlayProps) => {
		return <>{props.children}</>;
	});
	const LayoutUi = mock.fn(() => null);
	const layoutProvider = () => ({
		component: LayoutUi
	});

	const CustomWidgetMap = {
		ModalOverlay
	} satisfies Partial<ClientWidgetMap>;

	await act(() =>
		render(
			<TestWrapper store={store} customWidgetMap={CustomWidgetMap}>
				<ModalRegionUi
					regionReference={rootRegionRef}
					layoutProvider={layoutProvider}
					regionUiProvider={regionUiProviderMock}
					viewProvider={viewProviderMock}
					progressComponentProvider={progressComponentProviderMock}
				/>
			</TestWrapper>
		)
	);
	return {
		ModalOverlay,
		LayoutUi
	};
}
