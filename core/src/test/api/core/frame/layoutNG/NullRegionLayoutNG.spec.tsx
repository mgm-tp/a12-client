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
