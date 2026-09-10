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
import type { Mock } from "node:test";
import { mock } from "node:test";

import { fireEvent } from "@testing-library/react";
import type { ComponentType, JSX } from "react";
import { act, useContext } from "react";

import { query } from "@com.mgmtp.a12.devtools/react";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { DataRoles } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/data-roles.js";
import { NavigationContentboxContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";
import { ApplicationFrame } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/application-frame/main/application-frame.view.js";
import { SizeContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-context.js";

import type { ClientWidgetMap } from "../../../../../../core/ClientWidgetMap.js";
import { FrameFactories } from "../../../../../../core/frame/index.js";
import type {
	ApplicationFrameLayoutProps,
	NavigationBarTitleProps
} from "../../../../../../core/frame/internal/layout/ApplicationFrameLayout.js";
import ApplicationFrameLayout from "../../../../../../core/frame/internal/layout/ApplicationFrameLayout.js";
import type { LayoutProvider } from "../../../../../../core/frame/internal/layout/LayoutProps.js";
import { MobileNavigationAction } from "../../../../../../core/frame/internal/layout/mobile-navigation.js";
import { ApplicationModel } from "../../../../../../core/model/index.js";
import { ViewSelectors } from "../../../../../../core/view/index.js";
import { modelWithSubRegions } from "../../../../../mocks/frame/storeMocks.js";
import { createActivity } from "../../../../../utils/activity.js";
import {
	assertCancelRequestedAction,
	isCancelRequested
} from "../../../../../utils/cancel_requested.js";
import {
	render,
	screen,
	within,
	type RenderResult
} from "../../../../../utils/rtl/rtl-extension.js";
import { TestWrapper } from "../../../../../utils/rtl/testWrapper.js";
import type { MockStore } from "../../utils.js";
import { createStoreForTest } from "../../utils.js";

describe("core.frame.internal.layout.ApplicationFrameLayout", () => {
	describe("Mobile Navigation", () => {
		let allViewsStub: Mock<typeof ViewSelectors.allRegions>;
		let mobileNavigationStub: Mock<typeof MobileNavigationAction.calculate>;

		beforeEach(() => {
			allViewsStub = mock.method(ViewSelectors, "allRegions");
			mobileNavigationStub = mock.method(MobileNavigationAction, "calculate");
		});

		describe("Back-Button", () => {
			describe("if the sidebar is visible", () => {
				describe("and the evaluateMobileNavigationBackButtonAction returns a cancel back action", () => {
					async function testSetup(disableMobileNavigation?: true): Promise<SetupResult> {
						mobileNavigationStub.mock.mockImplementation(() => ({
							type: "CancelActivity",
							activitiesToCancel: ["A", "B"]
						}));
						return setup(setupLayoutProvider(), undefined, disableMobileNavigation);
					}

					describe("and 'disableMobileNavigation' is not set", () => {
						it("renders a back-button in the navigation bar of the sidebar, which cancels the given activities", async () => {
							const { store } = await testSetup();
							const sidebar = screen.getByTestId(DataRoles.ApplicationFrame.Sidebar);
							const button = within(sidebar).getByLabelText("Back");
							await act(() => fireEvent.click(button));

							assertCancelRequestedAction(store, ["A", "B"]);
						});

						it("renders no back-button in the navigation bar of the content", async () => {
							const { widgetSpys } = await testSetup();
							const { contentToolbar } = query(widgetSpys.ApplicationFrame).props();
							ok(contentToolbar === null, "Expected to find no back-button");
						});
					});

					describe("and 'disableMobileNavigation' is set to true", () => {
						it("renders no back-button in the navigation bar of the sidebar", async () => {
							await testSetup(true);
							const sidebar = screen.getByTestId(DataRoles.ApplicationFrame.Sidebar);
							const button = within(sidebar).queryByLabelText("Back");
							ok(button === null, "Expected to find no back-button");
						});

						it("renders no back-button in the navigation bar of the content", async () => {
							const { widgetSpys } = await testSetup(true);
							const { contentToolbar } = query(widgetSpys.ApplicationFrame).props();
							ok(contentToolbar === null, "Expected to find no back-button");
						});
					});
				});

				describe("and the evaluateMobileNavigationBackButtonAction returns no back action", () => {
					it("renders no back-button", async () => {
						mobileNavigationStub.mock.mockImplementation(() => undefined);

						const { widgetSpys } = await setup(setupLayoutProvider());
						const appFrame = query(widgetSpys.ApplicationFrame).props();
						ok(appFrame.contentToolbar === null);
						ok(appFrame.subToolbar === null);
					});
				});
			});

			describe("if the content is visible", () => {
				describe("and the layout states 'visibleView=single'", () => {
					describe("and the evaluateMobileNavigationBackButtonAction returns a 'cancel' back action", () => {
						async function testSetup(disableMobileNavigation?: true): Promise<SetupResult> {
							mobileNavigationStub.mock.mockImplementation(() => ({
								type: "CancelActivity",
								activitiesToCancel: ["A", "B"]
							}));
							const settings: ApplicationModel.ApplicationFrame.Settings = {
								initialSubExpanded: false
							};
							return setup(setupLayoutProvider(), undefined, disableMobileNavigation, settings);
						}

						describe("and 'disableMobileNavigation' is not set", () => {
							it("renders a navigationBarContext around the content with an onBackButtonClicked callback, which cancels the given activities", async () => {
								const { widgetSpys, store } = await testSetup();
								const { contentToolbar } = query(widgetSpys.ApplicationFrame).props();
								ok(contentToolbar === null);
								const button = screen.getById("content-back-button");

								await act(() => {
									fireEvent.click(button);
								});

								assertCancelRequestedAction(store, ["A", "B"]);
							});
						});

						describe("and 'disableMobileNavigation' is set to true", () => {
							it("renders a navigationBarContext around the content with no onBackButtonClicked callback", async () => {
								const { widgetSpys } = await testSetup(true);
								const { contentToolbar } = query(widgetSpys.ApplicationFrame).props();
								ok(contentToolbar === null);
								const button = screen.queryByLabelText("content-back-button");
								ok(button === null, "Expected to find no back-button");
							});
						});
					});

					describe("and the evaluateMobileNavigationBackButtonAction returns a 'switchRegion' back action", () => {
						async function testSetup(disableMobileNavigation?: true): Promise<SetupResult> {
							mobileNavigationStub.mock.mockImplementation(() => ({
								type: "RegionSwitch",
								switchToRegion: ["SIDEBAR"]
							}));
							const settings: ApplicationModel.ApplicationFrame.Settings = {
								initialSubExpanded: false
							};
							return setup(
								setupLayoutProvider("single"),
								undefined,
								disableMobileNavigation,
								settings
							);
						}

						describe("and 'disableMobileNavigation' is not set", () => {
							it("renders a the navigationBarContext around the content with an onBackButtonClicked callback, which expands the sidebar", async () => {
								const { widgetSpys, store } = await testSetup();

								const { contentToolbar } = query(widgetSpys.ApplicationFrame).props();
								ok(contentToolbar === null);
								const button = screen.getById("content-back-button");

								await act(() => {
									fireEvent.click(button);
								});

								strictEqual(store.getActions().some(isCancelRequested), false);
								screen.getByLabelText("Collapse sidebar");
							});
						});

						describe("and 'disableMobileNavigation' is set to true", () => {
							it("renders no navigationBarContext around the content", async () => {
								const { widgetSpys } = await testSetup(true);
								const { contentToolbar } = query(widgetSpys.ApplicationFrame).props();
								ok(contentToolbar === null);
								const button = screen.queryById("content-back-button");
								ok(button === null, "Expected to find no back-button");
							});
						});
					});

					describe("and the evaluateMobileNavigationBackButtonAction returns no back action", () => {
						it("renders a navigationBarContext around the content with no onBackButtonClicked callback", async () => {
							mobileNavigationStub.mock.mockImplementation(() => undefined);

							const { widgetSpys } = await setup(
								setupLayoutProvider("single"),
								undefined,
								undefined,
								{
									initialSubExpanded: false
								}
							);

							const { contentToolbar } = query(widgetSpys.ApplicationFrame).props();
							ok(contentToolbar === null);
							const button = screen.queryById("content-back-button");
							ok(button === null, "Expected to find no back-button");
						});
					});
				});

				describe("and the layout states 'visibleView=multiple'", () => {
					describe("and the evaluateMobileNavigationBackButtonAction returns a 'cancel' back action", () => {
						async function testSetup(disableMobileNavigation?: true): Promise<SetupResult> {
							mobileNavigationStub.mock.mockImplementation(() => ({
								type: "CancelActivity",
								activitiesToCancel: ["A", "B"]
							}));

							return setup(setupLayoutProvider("multiple"), undefined, disableMobileNavigation, {
								initialSubExpanded: false
							});
						}

						describe("and 'disableMobileNavigation' is not set", () => {
							it("renders a back-button in the navigation bar of the content, which cancels the given activities", async () => {
								const { store } = await testSetup();
								const button = screen.getByLabelText("Back");

								await act(() => {
									fireEvent.click(button);
								});

								assertCancelRequestedAction(store, ["A", "B"]);
							});

							it("renders no back-button in the navigation bar of the sidebar", async () => {
								const { widgetSpys } = await testSetup();
								strictEqual(query(widgetSpys.ApplicationFrame).props().subToolbar, null);
							});
						});

						describe("and 'disableMobileNavigation' is set to true", () => {
							it("renders no back-button in the navigation bar of the content", async () => {
								await testSetup(true);
								const button = screen.queryByLabelText("Back");
								ok(button === null, "Expected to find no back-button");
							});

							it("renders no back-button in the navigation bar of the sidebar", async () => {
								const { widgetSpys } = await testSetup(true);
								strictEqual(query(widgetSpys.ApplicationFrame).props().subToolbar, null);
							});
						});
					});

					describe("and the evaluateMobileNavigationBackButtonAction returns a 'switchRegion' back action", () => {
						async function testSetup(disableMobileNavigation?: true): Promise<SetupResult> {
							mobileNavigationStub.mock.mockImplementation(() => ({
								type: "RegionSwitch",
								switchToRegion: ["SIDEBAR"]
							}));
							const settings: ApplicationModel.ApplicationFrame.Settings = {
								initialSubExpanded: false
							};
							return setup(
								setupLayoutProvider("multiple"),
								undefined,
								disableMobileNavigation,
								settings
							);
						}

						describe("and 'disableMobileNavigation' is not set", () => {
							it("renders a back-button in the navigation bar of the content, which expands the sidebar", async () => {
								const { store } = await testSetup();
								const button = screen.getByLabelText("Back");

								await act(() => {
									fireEvent.click(button);
								});

								strictEqual(store.getActions().some(isCancelRequested), false);
								screen.getByLabelText("Collapse sidebar");
							});

							it("renders no back-button in the navigation bar of the sidebar", async () => {
								const { widgetSpys } = await testSetup();
								strictEqual(query(widgetSpys.ApplicationFrame).props().subToolbar, null);
							});
						});

						describe("and 'disableMobileNavigation' is is set to true", () => {
							it("renders no back-button in the navigation bar of the content", async () => {
								await testSetup(true);
								const button = screen.queryByLabelText("Back");
								ok(button === null, "Expected to find no back-button");
							});

							it("renders no back-button in the navigation bar of the sidebar", async () => {
								const { widgetSpys } = await testSetup(true);
								strictEqual(query(widgetSpys.ApplicationFrame).props().subToolbar, null);
							});
						});
					});

					describe("and the evaluateMobileNavigationBackButtonAction returns no back action", () => {
						it("renders no back-button", async () => {
							mobileNavigationStub.mock.mockImplementation(() => undefined);

							const { widgetSpys } = await setup(
								setupLayoutProvider("multiple"),
								undefined,
								undefined,
								{
									initialSubExpanded: false
								}
							);

							const { contentToolbar, subToolbar } = query(widgetSpys.ApplicationFrame).props();
							ok(contentToolbar === null);
							ok(subToolbar === null);
						});
					});
				});
			});
		});

		describe("Title", () => {
			describe("if the sidebar is visible", () => {
				describe("and the evaluateMobileNavigationBackButtonAction returns a back action", () => {
					async function testSetup(disableMobileNavigation?: true): Promise<SetupResult> {
						mobileNavigationStub.mock.mockImplementation(() => ({
							type: "CancelActivity",
							activitiesToCancel: ["A"]
						}));

						return setup(setupLayoutProvider(), NavigationBarTitle, disableMobileNavigation);
					}
					describe("and 'disableMobileNavigation' is not set", () => {
						it("renders the given 'navigationBarTitle' in the navigation bar of the sidebar", async () => {
							await testSetup();
							const sidebar = screen.getByTestId(DataRoles.ApplicationFrame.Sidebar);
							within(sidebar).getById("navigation-bar-title");
						});
					});

					describe("and 'disableMobileNavigation' is set to true", () => {
						it("does not render the given 'navigationBarTitle' in the navigation bar of the sidebar", async () => {
							await testSetup(true);
							const title = screen.queryById("navigation-bar-title");
							strictEqual(title, null, "Expected to find no title component");
						});
					});
				});
			});

			describe("if the content is visible", () => {
				describe("and the layout states 'visibleView=multiple'", () => {
					describe("and the evaluateMobileNavigationBackButtonAction returns a back action", () => {
						async function testSetup(disableMobileNavigation?: true): Promise<SetupResult> {
							mobileNavigationStub.mock.mockImplementation(() => ({
								type: "CancelActivity",
								activitiesToCancel: ["A"]
							}));
							const settings: ApplicationModel.ApplicationFrame.Settings = {
								initialSubExpanded: false
							};
							return setup(
								setupLayoutProvider("multiple"),
								NavigationBarTitle,
								disableMobileNavigation,
								settings
							);
						}

						describe("and 'disableMobileNavigation' is not set", () => {
							it("renders the given 'navigationBarTitle' in the navigation bar of the content", async () => {
								await testSetup();
								const main = screen.getByTestId(DataRoles.ApplicationFrame.Main);
								within(main).getById("navigation-bar-title");
							});
						});

						describe("and 'disableMobileNavigation' is true", () => {
							it("does not render the given 'navigationBarTitle' in the navigation bar of the content", async () => {
								await testSetup(true);
								const main = screen.getByTestId(DataRoles.ApplicationFrame.Main);
								const title = within(main).queryById("navigation-bar-title");
								ok(title === null, "Expected to find no title component");
							});
						});
					});
				});
			});
		});

		interface SetupResult {
			store: MockStore;
			result: RenderResult;
			widgetSpys: Pick<ClientWidgetMap, "ApplicationFrame">;
		}

		async function setup(
			layoutProvider: LayoutProvider,
			title?: ComponentType<NavigationBarTitleProps>,
			disableMobileNavigation?: true,
			settings?: ApplicationModel.ApplicationFrame.Settings
		): Promise<SetupResult> {
			const props: ApplicationFrameLayoutProps = {
				regionReference: [],
				layoutProvider: layoutProvider,
				regionUiProvider: FrameFactories.regionUiProvider,
				viewProvider: () => () => <div />,
				progressComponentProvider: FrameFactories.createProgressComponentProvider(),
				views: [],
				navigationBarTitle: title,
				disableMobileNavigation,
				settings
			};

			const activities = {
				A: createActivity({ id: "A" }),
				B: createActivity({ id: "B", initiatingActivityId: "A" })
			};

			const view1 = { name: "View1", activityId: "A" };
			const view1Info: ViewSelectors.AddDirective = {
				...viewInformationContent,
				...view1
			};

			const view2 = { name: "View-Sidebar", activityId: "B" };
			const view2Info: ViewSelectors.AddDirective = {
				...viewInformationSidebar,
				...view2
			};

			setupViewSelectorStub({ allViews: [view1Info, view2Info, view2Info] });

			const store = createStoreForTest({
				appModel: modelWithSubRegions,
				initialState: { activities }
			});

			const widgetSpys = {
				ApplicationFrame: mock.fn(ApplicationFrame)
			} satisfies Partial<ClientWidgetMap>;

			const result = await act(() =>
				render(
					<TestWrapper store={store} customWidgetMap={widgetSpys}>
						<SizeContext.Provider value={{ currentSize: "sm" }}>
							<ApplicationFrameLayout.component {...props} />
						</SizeContext.Provider>
					</TestWrapper>
				)
			);

			return {
				store,
				result,
				widgetSpys
			};
		}

		function setupViewSelectorStub(options: { allViews: ViewSelectors.AddDirective[] }): void {
			const customSelector = () => {
				return options.allViews;
			};

			allViewsStub.mock.mockImplementation(() => customSelector);
		}

		function setupLayoutProvider(visibleViews?: "single" | "multiple"): LayoutProvider {
			const layoutProvider: LayoutProvider = () => {
				return {
					component: MockLayout,
					visibleViews
				};
			};

			return layoutProvider;
		}

		const viewInformationContent = {
			region: ["CONTENT"],
			type: "VIEW_ADD" as const,
			name: "CONTENT"
		};

		const viewInformationSidebar = {
			region: ["SIDEBAR"],
			type: "VIEW_ADD" as const,
			name: "SIDEBAR"
		};

		function MockLayout(props: {
			regionReference: ApplicationModel.Region.Reference;
		}): JSX.Element | null {
			const contentBoxContext = useContext(NavigationContentboxContext);
			if (ApplicationModel.Region.Reference.equal(props.regionReference, ["CONTENT"])) {
				const backButton = contentBoxContext.onBackButtonClicked ? (
					<Button
						id="content-back-button"
						onClick={() => contentBoxContext.onBackButtonClicked!()}
					/>
				) : undefined;
				return <div>{backButton}</div>;
			}

			return null;
		}

		function NavigationBarTitle(props: NavigationBarTitleProps): JSX.Element {
			return <ContentBoxElements.Title id="navigation-bar-title" text="test" />;
		}
	});
});
