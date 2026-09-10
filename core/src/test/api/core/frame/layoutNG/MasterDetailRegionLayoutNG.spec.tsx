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
import type { Store } from "redux";

import { within, type RenderResult } from "@com.mgmtp.a12.devtools/react";

import { ActivityActions } from "../../../../../core/activity/index.js";
import {
	ModuleRegistryProvider,
	ModuleTestExtensions
} from "../../../../../core/application/index.js";
import type {
	DynamicConfiguration,
	DynamicFlow,
	DynamicRegion
} from "../../../../../core/configurationNG/index.js";
import { MasterDetailRegionLayoutNG } from "../../../../../core/frame/index.js";
import { StoreActions } from "../../../../../core/store/index.js";

import { renderRootRegion, ViewComponent } from "./utils.js";

function testModule(): DynamicConfiguration {
	const REGIONS: DynamicRegion[] = [{ name: "MasterDetail", layout: MasterDetailRegionLayoutNG }];
	const FLOWS: DynamicFlow[] = [
		{
			name: "mdFlow",
			scenes: [
				{
					name: "mdScene",
					matches: descriptor => descriptor.test === "masterdetail",
					sceneChange: {
						onEnter: [
							{
								type: "DYNAMIC_ADD_VIEW",
								component: ViewComponent,
								region: "MasterDetail"
							}
						]
					}
				}
			]
		}
	];

	return {
		id: "masterDetailTest",
		regions: REGIONS,
		flows: FLOWS
	};
}

describe("core.frame.layoutNG", () => {
	let result: RenderResult;
	let store: Store;

	beforeEach(async () => {
		({ result, store } = await renderRootRegion("MasterDetail"));
		await act(() => ModuleRegistryProvider.getInstance().addModule(testModule()));
	});

	afterEach(async () => {
		await act(() => store.dispatch(StoreActions.resetState()));
		await ModuleTestExtensions.reset();
	});

	describe("renders a MasterDetailRegionLayoutNG", () => {
		it("without views if no activity matches", async () => {
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

			await act(() =>
				store.dispatch(
					ActivityActions.create({
						activityId: "456",
						activityDescriptor: { unrelated: "" },
						loadingState: "without"
					})
				)
			);

			const viewComponents1 = within(result.baseElement).queryAllByDataTestId("ViewComponent");
			strictEqual(viewComponents1.length, 0);
		});

		it("with one view for one matching activity", async () => {
			await act(() =>
				store.dispatch(
					ActivityActions.create({
						activityId: "123",
						activityDescriptor: { test: "masterdetail" },
						loadingState: "without"
					})
				)
			);

			const viewComponent = within(result.baseElement).getByDataTestId("ViewComponent");
			strictEqual(viewComponent.dataset.activityid, "123");
		});

		it("with two views for two matching activities", async () => {
			await act(() =>
				store.dispatch(
					ActivityActions.create({
						activityId: "123",
						activityDescriptor: { test: "masterdetail" },
						loadingState: "without"
					})
				)
			);

			await act(() =>
				store.dispatch(
					ActivityActions.create({
						activityId: "456",
						activityDescriptor: { test: "masterdetail" },
						loadingState: "without"
					})
				)
			);

			const viewComponents = within(result.baseElement).getAllByDataTestId("ViewComponent");
			strictEqual(viewComponents.length, 2);
			strictEqual(viewComponents.at(0)?.dataset.activityid, "123");
			strictEqual(viewComponents.at(1)?.dataset.activityid, "456");
		});

		it("with two views for latest two out of three matching activities", async () => {
			await act(() => {
				store.dispatch(
					ActivityActions.create({
						activityId: "123",
						activityDescriptor: { test: "masterdetail" },
						loadingState: "without"
					})
				);

				store.dispatch(
					ActivityActions.create({
						activityId: "456",
						activityDescriptor: { test: "masterdetail" },
						loadingState: "without"
					})
				);

				store.dispatch(
					ActivityActions.create({
						activityId: "789",
						activityDescriptor: { test: "masterdetail" },
						loadingState: "without"
					})
				);
			});

			const viewComponents = within(result.baseElement).getAllByDataTestId("ViewComponent");
			strictEqual(viewComponents.length, 2);
			strictEqual(viewComponents.at(0)?.dataset.activityid, "456");
			strictEqual(viewComponents.at(1)?.dataset.activityid, "789");
		});
	});
});
