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

import { deepStrictEqual, strictEqual } from "node:assert/strict";

import { act, type JSX } from "react";
import type { Store } from "redux";

import { within } from "@com.mgmtp.a12.devtools/react";

import { ActivityActions } from "../../../../core/activity/index.js";
import {
	ModuleRegistryProvider,
	ModuleTestExtensions
} from "../../../../core/application/index.js";
import type {
	DynamicAddView,
	DynamicFlow,
	DynamicRegion
} from "../../../../core/configurationNG/index.js";
import { DynamicModelSelectors } from "../../../../core/configurationNG/index.js";
import { dynamicAllViews } from "../../../../core/configurationNG/internal/dynamicSelectors.js";
import type { LayoutPropsNG } from "../../../../core/frame/index.js";
import type { ViewNGProps } from "../../../../core/view/internal/viewNG.js";
import { createApplicationSetup } from "../../../utils/test-utils.js";

import { renderRootRegion } from "../frame/layoutNG/utils.js";

interface GreetingViewProps extends ViewNGProps {
	readonly greeting?: string;
}

function GreetingView(props: GreetingViewProps): JSX.Element {
	return (
		<span
			data-testid="GreetingView"
			data-activityid={props.activityId}
			data-greeting={props.greeting}
		/>
	);
}

interface TitledLayoutProps extends LayoutPropsNG {
	readonly title?: string;
}

function TitledLayout(props: TitledLayoutProps): JSX.Element {
	return (
		<div data-testid="TitledLayout" data-title={props.title}>
			{props.views.map(view => (
				<view.Component key={view.props.activityId} {...view.props} />
			))}
		</div>
	);
}

interface RequiredGreetingViewProps extends ViewNGProps {
	readonly greeting: string;
}

function RequiredGreetingView(props: RequiredGreetingViewProps): JSX.Element {
	return <span>{props.greeting}</span>;
}

interface RequiredTitledLayoutProps extends LayoutPropsNG {
	readonly title: string;
}

function RequiredTitledLayout(props: RequiredTitledLayoutProps): JSX.Element {
	return <div>{props.title}</div>;
}

function componentPropsModule() {
	const FLOWS: DynamicFlow[] = [
		{
			name: "componentPropsFlow",
			scenes: [
				{
					name: "greetingScene",
					matches: descriptor => descriptor.test === "greeting",
					sceneChange: {
						onEnter: [
							{
								type: "DYNAMIC_ADD_VIEW",
								component: GreetingView,
								region: "ComponentProps",
								componentProps: { greeting: "hello" }
							}
						]
					}
				},
				{
					name: "shadowAttemptScene",
					matches: descriptor => descriptor.test === "shadowAttempt",
					sceneChange: {
						onEnter: [
							{
								type: "DYNAMIC_ADD_VIEW",
								component: GreetingView,
								region: "ComponentProps",
								// the type rejects core-injected keys; the runtime drops them too,
								// which is what the assertion below proves
								// @ts-expect-error -- activityId is not contributable
								componentProps: { activityId: "ignored" }
							}
						]
					}
				}
			]
		}
	];

	return {
		id: "componentPropsTest",
		// built inside the selector on purpose: componentProps are plain data,
		// so fresh objects on every state change must not affect stability
		regions: (): DynamicRegion[] => [
			{
				name: "ComponentProps",
				layout: { component: TitledLayout, componentProps: { title: "layout-title" } }
			}
		],
		flows: () => FLOWS
	};
}

async function createActivity(store: Store, activityId: string, test: string): Promise<void> {
	await act(() =>
		store.dispatch(
			ActivityActions.create({
				activityId,
				activityDescriptor: { test },
				loadingState: "without"
			})
		)
	);
}

describe("core.configurationNG.componentProps", () => {
	afterEach(async () => {
		await ModuleTestExtensions.reset();
	});

	it("passes componentProps of a view directive to the view component", async () => {
		const { result, store } = await renderRootRegion("ComponentProps");
		await act(() => ModuleRegistryProvider.getInstance().addModule(componentPropsModule()));

		await createActivity(store, "A1", "greeting");

		const view = within(result.baseElement).getByDataTestId("GreetingView");
		strictEqual(view.dataset.activityid, "A1");
		strictEqual(view.dataset.greeting, "hello");
	});

	it("does not let componentProps of a view directive shadow core-injected props", async () => {
		const { result, store } = await renderRootRegion("ComponentProps");
		await act(() => ModuleRegistryProvider.getInstance().addModule(componentPropsModule()));

		await createActivity(store, "A2", "shadowAttempt");

		const view = within(result.baseElement).getByDataTestId("GreetingView");
		strictEqual(view.dataset.activityid, "A2");
	});

	it("does not let componentProps shadow core-injected props in the list of all views", async () => {
		const { store } = await renderRootRegion("ComponentProps");
		await act(() => ModuleRegistryProvider.getInstance().addModule(componentPropsModule()));

		await createActivity(store, "A3", "shadowAttempt");

		deepStrictEqual(
			dynamicAllViews()(store.getState()).map(view => view.props.activityId),
			["A3"]
		);
	});

	it("passes componentProps of a region layout to the layout component", async () => {
		const { result } = await renderRootRegion("ComponentProps");
		await act(() => ModuleRegistryProvider.getInstance().addModule(componentPropsModule()));

		const layout = within(result.baseElement).getByDataTestId("TitledLayout");
		strictEqual(layout.dataset.title, "layout-title");
	});

	it("does not accept components that require their own props", () => {
		const directive: DynamicAddView = {
			type: "DYNAMIC_ADD_VIEW",
			// @ts-expect-error -- a directive promises only the core-injected props
			component: RequiredGreetingView,
			region: "ComponentProps",
			componentProps: { greeting: "hello" }
		};
		const region: DynamicRegion = {
			name: "ComponentProps",
			// @ts-expect-error -- a region layout promises only the core-injected props
			layout: { component: RequiredTitledLayout, componentProps: { title: "layout-title" } }
		};

		strictEqual(directive.component, RequiredGreetingView);
		strictEqual(region.layout.component, RequiredTitledLayout);
	});

	it("keeps region info referentially stable while componentProps are rebuilt on state changes", async () => {
		const { store } = createApplicationSetup();
		await ModuleRegistryProvider.getInstance().addModule(componentPropsModule());

		const selectRegionInfo = DynamicModelSelectors.dynamicRegionInfo("ComponentProps");
		const before = selectRegionInfo(store.getState());

		store.dispatch(
			ActivityActions.create({
				activityId: "unrelated",
				activityDescriptor: { unrelated: "" },
				loadingState: "without"
			})
		);

		strictEqual(selectRegionInfo(store.getState()), before);
	});
});
