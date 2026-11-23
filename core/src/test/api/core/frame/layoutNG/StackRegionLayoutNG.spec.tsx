// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";

import { act } from "react";
import type { Store } from "redux";

import { within, type RenderResult } from "@com.mgmtp.a12.devtools/react";

import { ActivityActions } from "../../../../../core/activity/index.js";
import {
	ModuleRegistryProvider,
	ModuleTestExtensions
} from "../../../../../core/application/index.js";
import type { DynamicFlow, DynamicRegion } from "../../../../../core/configurationNG/index.js";
import { StackRegionLayoutNG } from "../../../../../core/frame/index.js";
import { StoreActions } from "../../../../../core/store/internal/actions.js";

import { renderRootRegion, ViewComponent } from "./utils.js";

function testModule() {
	const REGIONS: DynamicRegion[] = [{ name: "Stack", layout: StackRegionLayoutNG }];
	const FLOWS: DynamicFlow[] = [
		{
			name: "stackFlow",
			scenes: [
				{
					name: "stackScene",
					matches: descriptor => descriptor.test === "stack",
					sceneChange: {
						onEnter: [
							{
								type: "DYNAMIC_ADD_VIEW",
								component: ViewComponent,
								region: "Stack"
							}
						]
					}
				}
			]
		}
	];

	return {
		id: "stackTest",
		regions: () => REGIONS,
		flows: () => FLOWS
	};
}

describe("core.frame.layoutNG", () => {
	let result: RenderResult;
	let store: Store;

	beforeEach(async () => {
		({ result, store } = await renderRootRegion("Stack"));
		await act(() => ModuleRegistryProvider.getInstance().addModule(testModule()));
	});

	afterEach(async () => {
		await act(() => store.dispatch(StoreActions.resetState()));
		await ModuleTestExtensions.reset();
	});

	describe("renders a StackRegionLayoutNG", () => {
		it("without views if no activity matches", async () => {
			await act(() => {
				store.dispatch(
					ActivityActions.create({
						activityId: "123",
						activityDescriptor: { unrelated: "" },
						loadingState: "without"
					})
				);
			});

			const viewComponents = within(result.baseElement).queryAllByDataTestId("ViewComponent");
			strictEqual(viewComponents.length, 0);
		});

		it("with a single view for the last of all matching activities", async () => {
			await act(() => {
				store.dispatch(
					ActivityActions.create({
						activityId: "123",
						activityDescriptor: { test: "stack" },
						loadingState: "without"
					})
				);

				store.dispatch(
					ActivityActions.create({
						activityId: "456",
						activityDescriptor: { test: "stack" },
						loadingState: "without"
					})
				);
			});

			const viewComponent = within(result.baseElement).getByDataTestId("ViewComponent");
			strictEqual(viewComponent.dataset.activityid, "456");
		});
	});
});
