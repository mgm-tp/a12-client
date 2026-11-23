// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";
import { mock } from "node:test";

import { act } from "@testing-library/react";
import type { Store } from "redux";

import { within, type RenderResult } from "@com.mgmtp.a12.devtools/react";

import { ActivityActions } from "../../../../../core/activity/index.js";
import {
	ModuleRegistryProvider,
	ModuleTestExtensions
} from "../../../../../core/application/index.js";
import type { DynamicFlow, DynamicRegion } from "../../../../../core/configurationNG/index.js";
import {
	ApplicationFrameLayoutNG,
	ApplicationFrameLayoutNGComponent,
	type ApplicationFrameLayoutPropsNG,
	type FrameViews
} from "../../../../../core/frame/index.js";
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

describe("core.frame.layoutNG ApplicationFrameLayoutNG in a top-level region other than the root", () => {
	let store: Store;

	afterEach(async () => {
		await act(() => {
			store.dispatch(StoreActions.resetState());
			ModuleTestExtensions.reset();
		});
	});

	it("derives the main menu id from the region reference", async () => {
		const mainMenuComponent = mock.fn((_: FrameViews.MainMenuProps) => <div />);
		const layout = (props: ApplicationFrameLayoutPropsNG) => (
			<ApplicationFrameLayoutNGComponent {...props} mainMenuComponent={mainMenuComponent} />
		);
		({ store } = await renderRootRegion("GLOBAL"));
		await act(() =>
			ModuleRegistryProvider.getInstance().addModule({
				id: "globalTest",
				regions: () => [
					{
						name: "GLOBAL",
						layout: { component: layout },
						subRegions: [{ name: "CONTENT", layout: { component: ContentMock } }]
					}
				]
			})
		);

		strictEqual(mainMenuComponent.mock.calls.at(-1)?.arguments[0].id, "root.global");
	});
});
