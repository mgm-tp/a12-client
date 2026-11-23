// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";

import { act } from "react";

import { within } from "@com.mgmtp.a12.devtools/react";

import { ActivityActions } from "../../../../../core/activity/index.js";
import {
	ModuleRegistryProvider,
	ModuleTestExtensions
} from "../../../../../core/application/index.js";
import type { DynamicFlow, DynamicRegion } from "../../../../../core/configurationNG/index.js";
import { NullRegionLayoutNG, StackRegionLayoutNG } from "../../../../../core/frame/index.js";

import { renderRootRegion, ViewComponent } from "./utils.js";

function testNullModule() {
	const REGIONS: DynamicRegion[] = [{ name: "Null", layout: NullRegionLayoutNG }];
	const FLOWS: DynamicFlow[] = [
		{
			name: "nullFlow",
			scenes: [
				{
					name: "nullScene",
					matches: descriptor => descriptor.test === "null",
					sceneChange: {
						onEnter: [
							{
								type: "DYNAMIC_ADD_VIEW",
								component: ViewComponent,
								region: "Null"
							}
						]
					}
				}
			]
		}
	];

	return {
		id: "nullTest",
		regions: () => REGIONS,
		flows: () => FLOWS
	};
}

function testNullWithSubregionsModule() {
	const REGIONS: DynamicRegion[] = [
		{
			name: "NullWithSubregions",
			layout: NullRegionLayoutNG,
			subRegions: [
				{ name: "Sub1", layout: StackRegionLayoutNG },
				{ name: "Sub2", layout: StackRegionLayoutNG }
			]
		}
	];
	const FLOWS: DynamicFlow[] = [
		{
			name: "nullFlow",
			scenes: [
				{
					name: "nullScene",
					matches: descriptor => descriptor.test === "null",
					sceneChange: {
						onEnter: [
							{
								type: "DYNAMIC_ADD_VIEW",
								component: ViewComponent,
								region: "NullWithSubregions"
							}
						]
					}
				},
				{
					name: "nullSubregionScene1",
					matches: descriptor => descriptor.test === "nullSubRegion1",
					sceneChange: {
						onEnter: [
							{
								type: "DYNAMIC_ADD_VIEW",
								component: ViewComponent,
								region: "NullWithSubregions/Sub1"
							}
						]
					}
				},
				{
					name: "nullSubregionScene2",
					matches: descriptor => descriptor.test === "nullSubRegion2",
					sceneChange: {
						onEnter: [
							{
								type: "DYNAMIC_ADD_VIEW",
								component: ViewComponent,
								region: "NullWithSubregions/Sub2"
							}
						]
					}
				}
			]
		}
	];

	return {
		id: "nullWithSubregionsTest",
		regions: () => REGIONS,
		flows: () => FLOWS
	};
}

describe("core.frame.layoutNG", () => {
	afterEach(async () => {
		await ModuleTestExtensions.reset();
	});

	describe("renders a NullRegionLayoutNG", () => {
		it("without views if no activity matches", async () => {
			const { result, store } = await renderRootRegion("Null");
			await act(() => ModuleRegistryProvider.getInstance().addModule(testNullModule()));

			await act(() =>
				store.dispatch(
					ActivityActions.create({
						activityId: "123",
						activityDescriptor: { unrelated: "" },
						loadingState: "without"
					})
				)
			);

			const viewComponents = within(result.baseElement).queryAllByDataTestId("ViewComponent");
			strictEqual(viewComponents.length, 0);
		});

		it("with views of subregion layouts if they exist instead of any own views", async () => {
			const { result: wrapper, store } = await renderRootRegion("NullWithSubregions");
			await act(() => {
				ModuleRegistryProvider.getInstance().addModule(testNullWithSubregionsModule());

				store.dispatch(
					ActivityActions.create({
						activityId: "A",
						activityDescriptor: { test: "null" },
						loadingState: "without"
					})
				);

				store.dispatch(
					ActivityActions.create({
						activityId: "B",
						activityDescriptor: { test: "nullSubRegion1" },
						loadingState: "without"
					})
				);

				store.dispatch(
					ActivityActions.create({
						activityId: "C",
						activityDescriptor: { test: "nullSubRegion2" },
						loadingState: "without"
					})
				);
			});

			const viewComponents = within(wrapper.baseElement).getAllByDataTestId("ViewComponent");
			strictEqual(viewComponents.length, 2);
			strictEqual(viewComponents.at(0)?.dataset.activityid, "B");
			strictEqual(viewComponents.at(1)?.dataset.activityid, "C");
		});

		it("with a view for each matching activity", async () => {
			const { result, store } = await renderRootRegion("Null");
			await act(() => ModuleRegistryProvider.getInstance().addModule(testNullModule()));

			await act(() => {
				store.dispatch(
					ActivityActions.create({
						activityId: "123",
						activityDescriptor: { test: "null" },
						loadingState: "without"
					})
				);

				store.dispatch(
					ActivityActions.create({
						activityId: "456",
						activityDescriptor: { test: "null" },
						loadingState: "without"
					})
				);
			});

			const viewComponents = within(result.baseElement).getAllByDataTestId("ViewComponent");
			strictEqual(viewComponents.length, 2);
			strictEqual(viewComponents.at(0)?.dataset.activityid, "123");
			strictEqual(viewComponents.at(1)?.dataset.activityid, "456");
		});
	});
});
