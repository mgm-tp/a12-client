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

import { ok, strictEqual } from "node:assert/strict";
import { mock, type Mock } from "node:test";

import { act } from "react";
import type { Store } from "redux";

import { query } from "@com.mgmtp.a12.devtools/react";
import {
	MasterDetail,
	SizeContext,
	type SizeContextProps
} from "@com.mgmtp.a12.widgets/widgets-core";

import { ActivityActions } from "../../../../../core/activity/index.js";
import type { LayoutProps } from "../../../../../core/frame/internal/layout/LayoutProps.js";
import MasterDetailRegionLayout from "../../../../../core/frame/internal/layout/MasterDetailRegionLayout.js";
import { ApplicationModel } from "../../../../../core/model/index.js";
import type { View } from "../../../../../core/view/index.js";
import LayoutProviderMock from "../../../../mocks/frame/LayoutProviderMock.js";
import { progressComponentProviderMock } from "../../../../mocks/frame/progressComponentFactory.js";
import { regionUiProviderMock } from "../../../../mocks/frame/RegionUiMock.js";
import { modelWithSubRegions } from "../../../../mocks/frame/storeMocks.js";
import { ViewProviderWithNodeMocks } from "../../../../mocks/frame/viewProvider.js";
import { createGeneralStore } from "../../../../mocks/store/store.js";
import { createActivity } from "../../../../utils/activity.js";
import { render, within } from "../../../../utils/rtl/rtl-extension.js";
import { TestWrapper } from "../../../../utils/rtl/testWrapper.js";

import { createStoreForTest, createViewWithActivity, getViewsAndActivities } from "../utils.js";

import { describeErrorBoundaryTestForLayout } from "./Layout_ErrorBoundary.js";
import { describeProgressComponentTestForLayout } from "./Layout_ProgressIndicator.js";

const { MASTER_DETAIL_CONSTRAINTS_TYPE } = ApplicationModel.MasterDetail;

describe("core.frame.internal.layout.MasterDetailRegionLayout", () => {
	describe("Rendering", () => {
		it("renders a MasterDetail if there is a least one view", async () => {
			const { views, activities } = getViewsAndActivities([createViewWithActivity("A", "ViewA")]);

			const {
				result,
				config: { Layout }
			} = await mountComponent({
				store: createStoreForTest({ initialState: { activities }, appModel: modelWithSubRegions }),
				views
			});

			query(Layout).assertRendered();
			within(result.baseElement).getByText("ViewA");
		});

		it("renders an empty div if there is no view", async () => {
			const { result } = await mountComponent({
				store: createStoreForTest({ appModel: modelWithSubRegions }),
				views: []
			});

			within(result.baseElement).getByDataTestId("empty-div");
		});
	});

	describe("visibleViews property", () => {
		it("renders a MasterDetail with two visible views", async () => {
			const { views, activities } = getViewsAndActivities([
				createViewWithActivity("A", "ViewA"),
				createViewWithActivity("B", "ViewB"),
				createViewWithActivity("C", "ViewC")
			]);

			const {
				result,
				config: { Layout }
			} = await mountComponent({
				store: createStoreForTest({ initialState: { activities }, appModel: modelWithSubRegions }),
				views
			});
			query(Layout).assertRendered();

			const viewA = within(result.baseElement).queryByText("ViewA");
			const viewB = within(result.baseElement).queryByText("ViewB");
			const viewC = within(result.baseElement).queryByText("ViewC");

			strictEqual(viewA, null, "Expected not to find ViewA");
			ok(viewB, "Expected to find ViewB");
			ok(viewC, "Expected to find ViewC");
		});

		it("renders a MasterDetail with two visible views with preferred width", async () => {
			const preferredWidth = 8;

			const { views, activities } = getViewsAndActivities([
				createViewWithActivity("A", "ViewA"),
				createViewWithActivity("B", "ViewB", undefined, {
					type: MASTER_DETAIL_CONSTRAINTS_TYPE,
					preferredWidth: 10
				}),
				createViewWithActivity("C", "ViewC", undefined, {
					type: MASTER_DETAIL_CONSTRAINTS_TYPE,
					preferredWidth
				})
			]);

			const {
				config: { LayoutWidget }
			} = await mountComponent({
				store: createStoreForTest({ initialState: { activities }, appModel: modelWithSubRegions }),
				views
			});

			const visibleViews = query(LayoutWidget).props().visibleViews;
			strictEqual(visibleViews[1].width, preferredWidth);
			strictEqual(visibleViews[0].width, 12 - preferredWidth);
		});
	});

	describe("Animation", () => {
		async function mountAndChangeViewStack(params: {
			operation: "add-view" | "remove-view";
			smallDevice?: true;
		}) {
			const views = [
				createViewWithActivity("A", "View-A"),
				createViewWithActivity("B", "View-B", "A")
			].map(va => va.view);

			const activityA = createActivity({ id: "A" });
			const activityB = createActivity({ id: "B", initiatingActivityId: "A" });

			const { store } = createGeneralStore({
				activities: [activityA, activityB],
				models: [],
				applicationModel: modelWithSubRegions
			});

			const { result, config } = await mountComponent({
				store,
				views,
				smallDevice: params.smallDevice
			});
			if (params.operation === "add-view") {
				await act(() => {
					store.dispatch(
						ActivityActions.create({
							activityId: "C",
							initiatingActivityId: "B",
							activityDescriptor: {}
						})
					);

					result.rerender(
						<MasterDetailTestWrapper
							store={store}
							views={[...views, createViewWithActivity("C", "ViewC", "B").view]}
							config={config}
						/>
					);
				});
			} else {
				store.dispatch(ActivityActions.cancel({ activityId: "B" }));
				await act(() =>
					result.rerender(
						<MasterDetailTestWrapper store={store} views={[views[0]]} config={config} />
					)
				);
			}
			return {
				result,
				config
			};
		}

		describe("on mobile mode", () => {
			describe("When a view is added to the layout", () => {
				it("animates the view from right to left", async () => {
					const {
						config: { LayoutWidget }
					} = await mountAndChangeViewStack({
						operation: "add-view",
						smallDevice: true
					});
					const animation = query(LayoutWidget).props().animation;
					strictEqual(animation?.animateSingleItem, "rtl");
				});
			});
			describe("When a view is removed from the layout", () => {
				it("animates the view from left to right", async () => {
					const {
						config: { LayoutWidget }
					} = await mountAndChangeViewStack({
						operation: "remove-view",
						smallDevice: true
					});
					const animation = query(LayoutWidget).props().animation;
					strictEqual(animation?.animateSingleItem, "ltr");
				});
			});
		});

		describe("on desktop mode", () => {
			describe("When a view is added to the layout", () => {
				it("uses the default behavior of the MasterDetail widget", async () => {
					const {
						config: { LayoutWidget }
					} = await mountAndChangeViewStack({
						operation: "add-view"
					});
					const animation = query(LayoutWidget).props().animation;
					strictEqual(animation?.animateSingleItem, undefined);
				});
			});
			describe("When a view is removed from the layout", () => {
				it("uses the default behavior of the MasterDetail widget", async () => {
					const {
						config: { LayoutWidget }
					} = await mountAndChangeViewStack({
						operation: "remove-view"
					});
					const animation = query(LayoutWidget).props().animation;
					strictEqual(animation?.animateSingleItem, undefined);
				});
			});
		});
	});

	describe("Accessibility", () => {
		it("hands sequential ascending aria levels starting with 1 to its visible views", async () => {
			const { views, activities } = getViewsAndActivities([
				createViewWithActivity("A", "ViewA"),
				createViewWithActivity("B", "ViewB"),
				createViewWithActivity("C", "ViewC")
			]);

			const {
				config: { viewProvider }
			} = await mountComponent({
				store: createStoreForTest({ initialState: { activities }, appModel: modelWithSubRegions }),
				views
			});
			// only last two views are visible, because of the master-detail logic
			const viewB = query(viewProvider("ViewB")).props();
			const viewC = query(viewProvider("ViewC")).props();

			strictEqual(viewB.ariaLevel, 1);
			strictEqual(viewC.ariaLevel, 2);
		});
	});

	describeProgressComponentTestForLayout(MasterDetailRegionLayout.component);

	describeErrorBoundaryTestForLayout(MasterDetailRegionLayout.component);
});

// construct config and render once / initially
async function mountComponent(props: MasterDetailInitialRenderProps) {
	const config = renderConfig(props.smallDevice);

	const result = await act(() =>
		render(<MasterDetailTestWrapper store={props.store} views={props.views} config={config} />)
	);

	return {
		result,
		config
	};
}

// passed into initial rerender
interface MasterDetailInitialRenderProps {
	store: Store<object>;
	views: View[];
	smallDevice?: true;
}

// passed into rerender (reusing from initial render)
interface MasterDetailTestComponentProps extends MasterDetailInitialRenderProps {
	config: ReturnType<typeof renderConfig>;
}

function MasterDetailTestWrapper(props: MasterDetailTestComponentProps) {
	const Layout = props.config.Layout;
	return (
		<TestWrapper store={props.store} customWidgetMap={props.config.widgetMap}>
			<SizeContext.Provider value={props.config.sizeContext}>
				<Layout
					regionReference={props.config.rootRegionRef}
					layoutProvider={props.config.layoutProvider}
					regionUiProvider={props.config.regionUiProvider}
					viewProvider={props.config.viewProvider}
					progressComponentProvider={props.config.progressComponentProvider}
					views={props.views}
				/>
			</SizeContext.Provider>
		</TestWrapper>
	);
}

// construct config for initial / single render
function renderConfig(smallDevice?: true) {
	const rootRegionRef: string[] = [];
	const sizeContext: SizeContextProps = { currentSize: smallDevice ? "sm" : undefined };
	const Layout: Mock<React.ComponentType<LayoutProps>> = mock.fn(
		MasterDetailRegionLayout.component
	);
	const viewProvider = ViewProviderWithNodeMocks();
	const LayoutWidget = mock.fn(MasterDetail);
	const layoutProvider = LayoutProviderMock;
	const regionUiProvider = regionUiProviderMock;
	const progressComponentProvider = progressComponentProviderMock;

	const widgetMap = {
		MasterDetail: LayoutWidget
	};

	return {
		rootRegionRef,
		sizeContext,
		Layout,
		viewProvider,
		layoutProvider,
		regionUiProvider,
		progressComponentProvider,
		LayoutWidget,
		widgetMap
	};
}
