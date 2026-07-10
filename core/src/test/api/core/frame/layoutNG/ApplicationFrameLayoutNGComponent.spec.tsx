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

import { strictEqual } from "node:assert/strict";

import { act } from "@testing-library/react";
import type { Store } from "redux";

import { within, type RenderResult } from "@com.mgmtp.a12.devtools/react";

import { ActivityActions } from "../../../../../core/activity/index.js";
import {
	ModuleRegistryProvider,
	ModuleTestExtensions
} from "../../../../../core/application/index.js";
import type { DynamicFlow, DynamicRegion } from "../../../../../core/configurationNG/index.js";
import { ApplicationFrameLayoutNG } from "../../../../../core/frame/index.js";
import { StoreActions } from "../../../../../core/store/internal/actions.js";

import { ContentMock, ModalMock, renderRootRegion, SidebarMock, ViewComponent } from "./utils.js";

function testModule() {
	const REGIONS: DynamicRegion[] = [
		{
			name: "",
			layout: ApplicationFrameLayoutNG,
			subRegions: [
				{
					name: "CONTENT",
					layout: { component: ContentMock }
				},
				{ name: "SIDEBAR", layout: { component: SidebarMock } },
				{ name: "MODAL", layout: { component: ModalMock } }
			]
		}
	];
	const FLOWS: DynamicFlow[] = [
		{
			name: "appFlow",
			scenes: [
				{
					name: "appScene1",
					matches: descriptor => descriptor.test === "content",
					sceneChange: {
						onEnter: [
							{
								type: "DYNAMIC_ADD_VIEW",
								component: ViewComponent,
								region: "/CONTENT"
							}
						]
					}
				},
				{
					name: "appScene2",
					matches: descriptor => descriptor.test === "sidebar",
					sceneChange: {
						onEnter: [
							{
								type: "DYNAMIC_ADD_VIEW",
								component: ViewComponent,
								region: "/SIDEBAR"
							}
						]
					}
				},
				{
					name: "appScene3",
					matches: descriptor => descriptor.test === "modal",
					sceneChange: {
						onEnter: [
							{
								type: "DYNAMIC_ADD_VIEW",
								component: ViewComponent,
								region: "/MODAL"
							}
						]
					}
				}
			]
		}
	];

	return {
		id: "appTest",
		regions: () => REGIONS,
		flows: () => FLOWS
	};
}

describe("core.frame.layoutNG", () => {
	let result: RenderResult;
	let store: Store;

	// store must be created before the module is added
	beforeEach(async () => {
		({ result, store } = await renderRootRegion());
		await act(() => ModuleRegistryProvider.getInstance().addModule(testModule()));
	});

	afterEach(async () => {
		await act(() => {
			store.dispatch(StoreActions.resetState());
			ModuleTestExtensions.reset();
		});
	});

	describe("renders a ApplicationFrameLayoutNG", () => {
		it("with views of the content region layout", async () => {
			await act(() => {
				store.dispatch(
					ActivityActions.create({
						activityId: "A",
						activityDescriptor: { test: "content" },
						loadingState: "without"
					})
				);

				store.dispatch(
					ActivityActions.create({
						activityId: "B",
						activityDescriptor: { test: "content" },
						loadingState: "without"
					})
				);
			});

			const layout = within(result.baseElement).getByDataTestId("ContentMock");

			const contentViews = within(layout).getAllByDataTestId("ViewComponent");
			strictEqual(contentViews.length, 2);

			strictEqual(contentViews[0].dataset.activityid, "A");
			strictEqual(contentViews[1].dataset.activityid, "B");
		});

		it("with additional views of the sidebar region layout, if it exists", async () => {
			await act(() => {
				store.dispatch(
					ActivityActions.create({
						activityId: "A",
						activityDescriptor: { test: "content" },
						loadingState: "without"
					})
				);

				store.dispatch(
					ActivityActions.create({
						activityId: "B",
						activityDescriptor: { test: "sidebar" },
						loadingState: "without"
					})
				);

				store.dispatch(
					ActivityActions.create({
						activityId: "C",
						activityDescriptor: { test: "sidebar" },
						loadingState: "without"
					})
				);
			});

			const contentLayout = within(result.baseElement).getByDataTestId("ContentMock");

			const contentView = within(contentLayout).getByDataTestId("ViewComponent");
			strictEqual(contentView.dataset.activityid, "A");

			const sidebarLayout = within(result.baseElement).getByDataTestId("SidebarMock");

			const sidebarViews = within(sidebarLayout).getAllByDataTestId("ViewComponent");
			strictEqual(sidebarViews.length, 2);

			strictEqual(sidebarViews[0].dataset.activityid, "B");
			strictEqual(sidebarViews[1].dataset.activityid, "C");
		});

		it("with additional views of the modal region layout, if it exists", async () => {
			await act(() => {
				store.dispatch(
					ActivityActions.create({
						activityId: "A",
						activityDescriptor: { test: "content" },
						loadingState: "without"
					})
				);

				store.dispatch(
					ActivityActions.create({
						activityId: "B",
						activityDescriptor: { test: "modal" },
						loadingState: "without"
					})
				);

				store.dispatch(
					ActivityActions.create({
						activityId: "C",
						activityDescriptor: { test: "modal" },
						loadingState: "without"
					})
				);
			});

			const contentLayout = within(result.baseElement).getByDataTestId("ContentMock");

			const contentView = within(contentLayout).getByDataTestId("ViewComponent");
			strictEqual(contentView.dataset.activityid, "A");

			const modalLayout = within(result.baseElement).getByDataTestId("ModalMock");
			const modalViews = within(modalLayout).getAllByDataTestId("ViewComponent");

			strictEqual(modalViews[0].dataset.activityid, "B");
			strictEqual(modalViews[1].dataset.activityid, "C");
		});
	});
});
