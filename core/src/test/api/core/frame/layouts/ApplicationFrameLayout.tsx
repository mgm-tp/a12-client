// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual, fail, notStrictEqual, ok, strictEqual } from "node:assert/strict";
import { mock } from "node:test";

import { fireEvent, type MatcherFunction, type RenderResult } from "@testing-library/react";
import { act, useState, type JSX, type RefObject } from "react";
import { Provider } from "react-redux";
import type { Store } from "redux";
import { StyleSheetManager, ThemeProvider } from "styled-components";

import { query, render, within } from "@com.mgmtp.a12.devtools/react";
import { DataRoles } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/data-roles.js";
import { shouldForwardProp } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/should-forward-prop.js";
import { addPrefix } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/utils.js";
import { ApplicationFrame } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/application-frame/main/application-frame.view.js";
import { SizeContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-context.js";
import type { SizeDetectorProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-detector.api.js";
import { defaultTheme } from "@com.mgmtp.a12.widgets/widgets-core/lib/theme/default/default-theme.js";

import { type ClientWidgetMap } from "../../../../../core/ClientWidgetMap.js";
import { FrameViews } from "../../../../../core/frame/index.js";
import MainMenu from "../../../../../core/frame/internal/components/MainMenu.js";
import type { ApplicationFrameLayoutProps } from "../../../../../core/frame/internal/layout/ApplicationFrameLayout.js";
import type {
	LayoutProps,
	LayoutProvider
} from "../../../../../core/frame/internal/layout/LayoutProps.js";
import type { MainMenuContextProps } from "../../../../../core/frame/internal/layout/MainMenuContext.js";
import { MainMenuContext } from "../../../../../core/frame/internal/layout/MainMenuContext.js";
import type { ApplicationModel } from "../../../../../core/model/index.js";
import { isRecord, noop } from "../../../../../core/utils.js";
import LayoutProviderMock from "../../../../mocks/frame/LayoutProviderMock.js";
import mockLayout, {
	type MockRegionLayoutContentProps
} from "../../../../mocks/frame/MockLayout.js";
import { progressComponentProviderMock } from "../../../../mocks/frame/progressComponentFactory.js";
import { regionUiProviderMock } from "../../../../mocks/frame/RegionUiMock.js";
import {
	modelForApplicationFrame,
	modelForSidebar,
	modelViewsInSubRegions,
	modelWithSubRegions
} from "../../../../mocks/frame/storeMocks.js";
import { viewProviderMock } from "../../../../mocks/frame/viewProvider.js";
import { createStoreForTest } from "../../../../unit/core/frame/utils.js";
import { createActivity } from "../../../../utils/activity.js";
import { KEY_OUTPUT_LOCALIZER_CONTEXT } from "../../../../utils/localization.js";
import { TestWrapper } from "../../../../utils/rtl/testWrapper.js";

import { defaultProps } from "./helpers.js";

export function describeAppFrameLayoutTests(): void {
	interface TestConfiguration {
		readonly smallDevice?: boolean;
		readonly enableChangePassword?: boolean;
		readonly customWidgetMap?: Partial<ClientWidgetMap>;
	}

	const logoURL = "images/a12_logo.svg";

	const activities = {
		A: createActivity({
			id: "A",
			descriptor: { page: "ModalRegion" }
		}),
		B: createActivity({
			id: "B",
			descriptor: {
				feature: "views",
				page: "features"
			}
		})
	};

	describe("Given a Redux store with an application model containing a CONTENT, SIDEBAR and MODAL sub region", () => {
		describe("and an authenticated user", () => {
			it("renders an ApplicationFrame widget", async () => {
				const result = await mountApplicationFrameLayout(
					createStoreForTest({ appModel: modelWithSubRegions }),
					defaultProps
				);

				const applicationFrame = within(result.baseElement).queryByTestId(
					DataRoles.ApplicationFrame
				);

				ok(applicationFrame, "Expected one ApplicationFrame");
			});
		});

		describe("Given a custom logo/title component passed to ApplicationFrame widget", () => {
			it("renders it", async () => {
				const result = await mountApplicationFrameLayout(
					createStoreForTest({ appModel: modelWithSubRegions }),
					{
						...defaultProps,
						logo: <CustomComponent />,
						title: <CustomComponent />
					}
				);

				const testComponents = within(result.baseElement).getAllByDataTestId("CustomComponent");
				strictEqual(testComponents.length, 2, "Expected two custom components");
			});
		});

		describe("Given a view in each region", () => {
			const viewsInRegions = [{ view: "ViewA", region: "content area" }];

			it("renders the custom error boundary component around the regions views", async () => {
				for (const viewInRegion of viewsInRegions) {
					const store = createStoreForTest({
						appModel: modelViewsInSubRegions,
						initialState: { activities }
					});
					const result = await mountApplicationFrameLayout(store, defaultProps);

					const contentAreaView = within(result.baseElement).getByText(viewInRegion.view);
					const contentAreaBoundary = contentAreaView.closest('[data-testid="ErrorBoundary"]');

					ok(
						contentAreaBoundary,
						`Expected one custom error boundary wrapping the ${viewInRegion.region} view`
					);
				}
			});
		});

		describe("given a desktop browser environment", () => {
			const testConfig = { smallDevice: false };

			describe("given the main area of the ApplicationFrame widget", testMainArea(testConfig));
			describe("given the sub area of the ApplicationFrame widget", testSidebarArea(testConfig));
			describe(
				"given the content area of the ApplicationFrame widget",
				testContentArea(testConfig)
			);
		});

		describe("given a mobile browser environment", () => {
			const testConfig = { smallDevice: true };
			describe("given the main area of the ApplicationFrame widget", testMainArea(testConfig));
			describe("given the sub area of the ApplicationFrame widget", testSidebarArea(testConfig));
			describe(
				"given the content area of the ApplicationFrame widget",
				testContentArea(testConfig)
			);
		});

		describe("given a browser environment which changes", () => {
			const baseProps: LayoutProps = {
				regionReference: [],
				layoutProvider: LayoutProviderMock,
				regionUiProvider: regionUiProviderMock,
				views: [],
				viewProvider: viewProviderMock,
				progressComponentProvider: progressComponentProviderMock
			};

			function ResizableAppFrameLayout(props: {
				setSizeRef: RefObject<SizeChange>;
				settings?: ApplicationModel.ApplicationFrame.Settings;
			}): JSX.Element {
				const [size, setSize] = useState<SizeDetectorProps.Size>("lg");
				props.setSizeRef.current = setSize;

				return (
					<StyleSheetManager shouldForwardProp={shouldForwardProp}>
						<ThemeProvider theme={defaultTheme}>
							<SizeContext.Provider value={{ currentSize: size }}>
								<FrameViews.ApplicationFrameLayout {...baseProps} settings={props.settings} />
							</SizeContext.Provider>
						</ThemeProvider>
					</StyleSheetManager>
				);
			}

			type SizeChange = (size: SizeDetectorProps.Size) => void;

			function mountResizableAppFrameLayout(
				setSizeRef: RefObject<SizeChange>,
				settings?: ApplicationModel.ApplicationFrame.Settings
			): Promise<RenderResult> {
				const store = createStoreForTest({
					appModel: modelForApplicationFrame,
					initialState: { activities }
				});

				return act(() =>
					render(
						<Provider store={store}>
							<ResizableAppFrameLayout setSizeRef={setSizeRef} settings={settings} />
						</Provider>
					)
				);
			}

			describe("from large device to small device", () => {
				describe("and the sidebar is expanded", () => {
					it("collapses the sidebar", async () => {
						const setSizeRef: RefObject<SizeChange> = { current: noop };
						const result = await mountResizableAppFrameLayout(setSizeRef);
						within(result.baseElement).getByRole("button", { name: "Collapse sidebar" });

						await act(() => setSizeRef.current("sm"));
						within(result.baseElement).getByRole("button", { name: "Expand sidebar" });
					});
				});

				describe("and the sidebar is collapsed", () => {
					it("keeps the sidebar collapsed", async () => {
						const setSizeRef: RefObject<SizeChange> = { current: noop };
						const result = await mountResizableAppFrameLayout(setSizeRef, {
							initialSubExpanded: false
						});
						within(result.baseElement).getByRole("button", { name: "Expand sidebar" });

						await act(() => setSizeRef.current("sm"));
						within(result.baseElement).getByRole("button", { name: "Expand sidebar" });
					});
				});
			});

			describe("from small device to large device", () => {
				describe("and the sidebar was expanded the last time the device size was large", () => {
					it("expands the sidebar", async () => {
						const setSizeRef: RefObject<SizeChange> = { current: noop };
						const result = await mountResizableAppFrameLayout(setSizeRef);

						await act(() => setSizeRef.current("sm"));
						await act(() => setSizeRef.current("lg"));
						within(result.baseElement).getByRole("button", { name: "Collapse sidebar" });
					});
				});

				describe("and the sidebar was collapsed the last time the device size was large", () => {
					it("collapses the sidebar", async () => {
						const setSizeRef: RefObject<SizeChange> = { current: noop };
						const result = await mountResizableAppFrameLayout(setSizeRef, {
							initialSubExpanded: false
						});

						await act(() => setSizeRef.current("sm"));
						await act(() => setSizeRef.current("lg"));
						within(result.baseElement).getByRole("button", { name: "Expand sidebar" });
					});
				});
			});
		});

		describe("given a widgetMap", () => {
			describe("that contains a mainMenuButtonComponent", () => {
				it("uses the provided component instead of the default main menu button", async () => {
					const store = createStoreForTest({
						appModel: modelViewsInSubRegions,
						initialState: { activities }
					});

					const mainMenuButtonComponent = mock.fn();
					const result = await mountApplicationFrameLayout(
						store,
						{
							...defaultProps,
							// TODO: Remove with A12-17777
							// oxlint-disable-next-line typescript/no-deprecated
							widgetMap: { mainMenuButtonComponent }
						},
						{ smallDevice: true }
					);

					const defaultButton = findHamburgerButton(result.baseElement);
					strictEqual(defaultButton, undefined, "Expected no default main menu button");

					const customButton = query(mainMenuButtonComponent).props();

					ok(isRecord(customButton));
					ok(customButton.icon);
					ok(customButton.buttonRef);
					ok(customButton.onClick);
				});
			});

			describe("that contains an applicationFrame component", () => {
				it("uses the provided component instead of the default widget", async () => {
					const store = createStoreForTest({
						appModel: modelViewsInSubRegions,
						initialState: { activities }
					});

					const CustomApplicationFrame = mock.fn(() => <span>Hello</span>);
					await mountApplicationFrameLayout(
						store,
						{
							...defaultProps,
							// TODO: Remove with A12-17777
							// oxlint-disable-next-line typescript/no-deprecated
							widgetMap: { applicationFrame: CustomApplicationFrame }
						},
						{ smallDevice: true }
					);

					query(CustomApplicationFrame).assertRendered(
						"Expected one custom applicationFrame component"
					);
				});
			});
		});

		describe("given a mainMenuComponent", () => {
			it("uses the provided component instead of the default main menu", async () => {
				const store = createStoreForTest({
					appModel: modelViewsInSubRegions,
					initialState: { activities }
				});

				const mainMenuComponent = mock.fn(() => <div>123</div>);

				await mountApplicationFrameLayout(store, {
					...defaultProps,
					mainMenuComponent
				});

				const q = query(mainMenuComponent);
				q.assertRendered("Expected one custom main menu");

				const props = q.props();

				ok(isRecord(props));
				notStrictEqual(props.mobileMode, undefined);
				notStrictEqual(props.expanded, undefined);
				notStrictEqual(props.onMenuItemClick, undefined);
			});
		});
	});

	function findHamburgerButton(container: HTMLElement): HTMLElement | undefined {
		const applicationHeader = within(container).getByTestId(DataRoles.ApplicationFrame.Header);
		return within(applicationHeader)
			.queryAllByDataRole("button")
			.find(b => b.textContent === "menu");
	}

	function testMainArea(config: TestConfiguration) {
		return () => {
			describe("Header", () => {
				async function setup(customWidgetMap?: Partial<ClientWidgetMap>) {
					const mainMenuComponent = mock.fn(MainMenu);
					const result = await mountApplicationFrameLayout(
						createStoreForTest({ appModel: modelWithSubRegions }),
						{ ...defaultProps, mainMenuComponent },
						{ ...config, customWidgetMap }
					);

					const applicationHeader = within(result.baseElement).getByTestId(
						DataRoles.ApplicationFrame.Header
					);

					return { result, applicationHeader, mainMenuComponent };
				}

				it("renders a React component given as globalMessageBox prop", async () => {
					const { applicationHeader } = await setup();

					within(applicationHeader).getByDataTestId("Marker");
				});

				it("renders an ApplicationHeader", async () => {
					const { applicationHeader } = await setup();

					ok(applicationHeader, "Expected one ApplicationHeader");
				});

				it("renders an ApplicationHeader which contains an image pointing to the given logo URL", async () => {
					const { applicationHeader } = await setup();

					const isLogoImg: MatcherFunction = (_, e) =>
						e?.tagName === "IMG" && e?.getAttribute("src") === logoURL;

					within(applicationHeader).getByPredicate(isLogoImg);
				});

				if (config.smallDevice) {
					it("renders an ApplicationHeader which contains a hamburger menu button", async () => {
						const { result } = await setup();

						const hamburgerButton = findHamburgerButton(result.baseElement);
						ok(hamburgerButton);
					});

					it("renders the hamburger menu button with a title indicating that clicking it would open the menu", async () => {
						const ButtonMock = mock.fn();
						await setup({ Button: ButtonMock });

						query(ButtonMock)
							.withProp("title", "frame.mainMenu.smallDevice.openMenuButtonTitle")
							.assertRendered();
					});

					it(
						"renders the hamburger menu button with a title indicating that clicking it would close the menu, " +
							"if the menu is already opened",
						async () => {
							const ButtonMock = mock.fn();
							await setup({ Button: ButtonMock });

							act(query(ButtonMock).props().onClick);

							query(ButtonMock)
								.withProp("title", "frame.mainMenu.smallDevice.closeMenuButtonTitle")
								.assertRendered();
						}
					);

					describe("when clicking on the hamburger menu button", () => {
						it("toggles the main menu expansion state", async () => {
							const { result, mainMenuComponent } = await setup();

							const hamburgerButton = findHamburgerButton(result.baseElement);
							ok(hamburgerButton);
							strictEqual(query(mainMenuComponent).props().expanded, false);

							await act(() => fireEvent.click(hamburgerButton));
							strictEqual(query(mainMenuComponent).props().expanded, true);
						});
					});
				}
			});

			describe("Header", () => {
				describe("given additional header items", () => {
					const classNameContentSlot = addPrefix("applicationHeader__contentSlot");
					describe("with orientation 'leftSlots-right'", () => {
						it("renders the additional component after the default components on the left", async () => {
							const store = createStoreForTest({ appModel: modelViewsInSubRegions });

							const leftItem = <div>customLeftComponent</div>;
							const headerItems: ReadonlyArray<FrameViews.HeaderItemProps> = [
								{
									item: leftItem,
									orientation: "leftSlots-right"
								}
							];

							const result = await mountApplicationFrameLayout(
								store,
								{
									...defaultProps,
									additionalHeaderItems: headerItems
								},
								config
							);

							const leftContentSlot = result.baseElement.querySelector(
								"div.applicationHeader__contentSlotWrapper--left"
							);
							const leftSlots = leftContentSlot?.querySelectorAll(`div.${classNameContentSlot}`);

							const positionOfLogo = elementPosition(0);
							const logo = leftSlots?.item(elementPosition(0))?.querySelector("img");
							ok(logo, `Expected that leftSlots[${positionOfLogo}] is an image`);

							const positionOfCustomLeftItem = elementPosition(2);
							const customItemLeft = leftSlots?.item(positionOfCustomLeftItem).querySelector("div");
							ok(
								customItemLeft,
								`Expected that the custom left item is at position ${positionOfCustomLeftItem}`
							);
							strictEqual(
								customItemLeft.textContent,
								"customLeftComponent",
								`Expected that the custom left item is at position ${positionOfCustomLeftItem}`
							);

							// in small mode, the first element is the menu button
							// - everything gets shifted by 1
							function elementPosition(i: number): number {
								const menuButtonPresent = config.smallDevice;
								return menuButtonPresent ? i + 1 : i;
							}
						});
					});

					describe("with orientation 'rightSlots-left'", () => {
						it("renders the additional component before the default components on the right", async () => {
							const store = createStoreForTest({ appModel: modelViewsInSubRegions });

							const rightItem = <div>customRightComponent</div>;
							const headerItems: ReadonlyArray<FrameViews.HeaderItemProps> = [
								{
									item: rightItem,
									orientation: "rightSlots-left"
								}
							];

							const result = await mountApplicationFrameLayout(
								store,
								{
									...defaultProps,
									additionalHeaderItems: headerItems
								},
								config
							);
							const rightContentSlot = result.baseElement.querySelector(
								"div.applicationHeader__contentSlotWrapper--right"
							);
							const rightSlots = rightContentSlot?.querySelectorAll(`div.${classNameContentSlot}`);

							const customItemRight = rightSlots?.item(0).querySelector("div");
							notStrictEqual(
								customItemRight,
								undefined,
								"Expected that the first item is the custom right component"
							);
							strictEqual(
								customItemRight?.textContent,
								"customRightComponent",
								"Expected that the first item is the custom left component"
							);
						});
					});
				});
			});

			describe("MainMenu", () => {
				async function render() {
					const mainMenuComponent = mock.fn(MainMenu);
					const appFrameComponent = mock.fn(ApplicationFrame);
					const widgetMap = {
						applicationFrame: appFrameComponent
					};

					const result = await mountApplicationFrameLayout(
						createStoreForTest({ appModel: modelWithSubRegions }),
						{
							...defaultProps,
							mainMenuComponent,
							// TODO: Remove with A12-17777
							// oxlint-disable-next-line typescript/no-deprecated
							widgetMap
						},
						config
					);

					return {
						...result,
						mainMenuComponent,
						appFrameComponent
					};
				}

				it("renders a main menu with expanded set to false", async () => {
					const { mainMenuComponent } = await render();
					const mainMenu = query(mainMenuComponent).props();
					strictEqual(mainMenu.expanded, false);
					strictEqual(mainMenu.mobileMode, config.smallDevice);
				});

				it("onMenuItemClick toggles the main menu expansion state in mobile mode, but not in desktop mode", async () => {
					const { mainMenuComponent } = await render();
					let mainMenu = query(mainMenuComponent).props();
					ok(mainMenu.onMenuItemClick, "Expected an onMenuItemClick callback");

					await act(mainMenu.onMenuItemClick);
					mainMenu = query(mainMenuComponent).props();
					strictEqual(
						mainMenu.expanded,
						config.smallDevice,
						`Expected expanded = ${config.smallDevice}`
					);

					await act(mainMenu.onMenuItemClick);
					mainMenu = query(mainMenuComponent).props();
					strictEqual(mainMenu.expanded, false, `Expected expanded = false`);
				});

				it("sets aria-hidden for content and footer if the main menu is expanded in mobile mode, but not in desktop mode", async () => {
					const { mainMenuComponent, appFrameComponent } = await render();

					let applicationFrame = query(appFrameComponent).props();
					strictEqual(
						applicationFrame.htmlAttributes,
						undefined,
						"Expected htmlAttributes to be undefined"
					);

					let mainMenu = query(mainMenuComponent).props();
					ok(mainMenu.onMenuItemClick, "Expected an onMenuItemClick callback");

					await act(mainMenu.onMenuItemClick);
					applicationFrame = query(appFrameComponent).props();
					mainMenu = query(mainMenuComponent).props();

					const expectedHtmlAttributes = config.smallDevice
						? {
								contentAttributes: { "aria-hidden": true },
								footerAttributes: { "aria-hidden": true }
							}
						: undefined;

					deepStrictEqual(
						applicationFrame.htmlAttributes,
						expectedHtmlAttributes,
						`Expected htmlAttributes = ${expectedHtmlAttributes}`
					);

					await act(mainMenu.onMenuItemClick);
					applicationFrame = query(appFrameComponent).props();
					strictEqual(
						applicationFrame.htmlAttributes,
						undefined,
						"Expected htmlAttributes to be undefined"
					);
				});
			});

			describe("Footer", () => {
				describe("given React element as footer prop", () => {
					it("passes the React element as prop to the Application Frame Widget", async () => {
						const store = createStoreForTest({ appModel: modelViewsInSubRegions });
						const customComponent = <CustomComponent />;
						const result = await mountApplicationFrameLayout(
							store,
							{ ...defaultProps, footer: customComponent },
							config
						);

						const footer = within(result.baseElement).getByDataRole(
							DataRoles.ApplicationFrame.Footer
						);
						within(footer).getByDataTestId("CustomComponent");
					});
				});
			});

			describe("MainMenuContext", () => {
				if (config.smallDevice) {
					async function render() {
						const TestComponent = mock.fn(DummyComponent);
						const mainMenuComponent = mock.fn(MainMenu);

						const testHeaderItem = (
							<MainMenuContext.Consumer>
								{value => (value ? <TestComponent {...value} /> : undefined)}
							</MainMenuContext.Consumer>
						);
						const testProps: ApplicationFrameLayoutProps = {
							...defaultProps,
							additionalHeaderItems: [{ item: testHeaderItem, orientation: "leftSlots-right" }],
							mainMenuComponent
						};
						const result = await mountApplicationFrameLayout(
							createStoreForTest({ appModel: modelWithSubRegions }),
							testProps,
							config
						);

						return {
							result,
							TestComponent,
							mainMenuComponent
						};
					}

					it("allows changing the expanded state of the mobile main menu via the props it provides", async () => {
						const { TestComponent, mainMenuComponent } = await render();

						const dummyComponent = query(TestComponent).props();
						const mainMenu = query(mainMenuComponent).props();
						const expandedStateBefore = mainMenu.expanded;

						await act(() => dummyComponent.setMainMenuExpanded(!dummyComponent.mainMenuExpanded));
						const mainMenuAfter = query(mainMenuComponent).props();
						strictEqual(mainMenuAfter.expanded, !expandedStateBefore);
					});
				}
			});
		};
	}

	function testSidebarArea(config: TestConfiguration) {
		const customLayoutProps: LayoutProps = {
			regionReference: [],
			layoutProvider: LayoutProviderMock,
			regionUiProvider: regionUiProviderMock,
			views: [],
			viewProvider: viewProviderMock,
			progressComponentProvider: progressComponentProviderMock
		};

		const ApplicationFrameMock = mock.fn(ApplicationFrame);
		const customProps: ApplicationFrameLayoutProps = {
			...customLayoutProps,
			// TODO: Remove with A12-17777
			// oxlint-disable-next-line typescript/no-deprecated
			widgetMap: {
				applicationFrame: ApplicationFrameMock
			}
		};

		return () => {
			const activityNormalSidebar = createActivity({
				id: "A",
				descriptor: { feature: "views", page: "normal-sidebar" }
			});
			const activityEnhancedSidebar = createActivity({
				id: "A",
				descriptor: { feature: "views", page: "extended-sidebar" }
			});

			async function render() {
				const store = createStoreForTest({
					appModel: modelForSidebar,
					initialState: {
						activities: {
							A: activityNormalSidebar
						}
					}
				});

				const { MockRegionLayoutContent, layoutProvider } = addMockLayout(
					customProps.layoutProvider
				);

				const result = await mountApplicationFrameLayout(
					store,
					{ ...customProps, layoutProvider },
					config
				);
				const sidebar = query(MockRegionLayoutContent).props();

				return {
					...result,
					sidebar,
					layoutProvider
				};
			}

			it("renders a sidebar component with the SIDEBAR layout and the correct props", async () => {
				const { sidebar, layoutProvider } = await render();
				strictEqual(sidebar.regionReference[0], "SIDEBAR");

				strictEqual(sidebar.layoutProvider, layoutProvider);
				strictEqual(sidebar.regionUiProvider.name, "regionUiProviderMock");
				strictEqual(sidebar.subExpanded, true);
				strictEqual(sidebar.viewProvider.name, "viewProviderMock");
			});

			describe("expansion state", () => {
				describe("if initialSubExpanded is not defined in the ApplicationFrameLayout settings", () => {
					it("renders initially an expanded sidebar", async () => {
						await render();
						const appFrame = query(ApplicationFrameMock).props();
						strictEqual(appFrame.subExpanded, true);
					});

					it("collapses the sub menu when setSubExpanded is called with false", async () => {
						const { sidebar } = await render();
						await act(() => sidebar.setSubExpanded?.(false));

						const appFrame = query(ApplicationFrameMock).props();
						strictEqual(appFrame.subExpanded, false);
					});

					it("expands the sub menu when setSubExpanded is called with true", async () => {
						const { sidebar } = await render();
						await act(() => sidebar.setSubExpanded?.(true));

						const appFrame = query(ApplicationFrameMock).props();
						strictEqual(appFrame.subExpanded, true);
					});
				});

				describe("if initialSubExpanded is is set to true in the ApplicationFrameLayout settings", () => {
					it("renders initially an expanded sidebar", async () => {
						const store = createStoreForTest({
							appModel: modelForSidebar,
							initialState: {
								activities: {
									A: activityEnhancedSidebar
								}
							}
						});
						const settings: ApplicationModel.ApplicationFrame.Settings = {
							initialSubExpanded: true
						};
						const props: ApplicationFrameLayoutProps = {
							...customProps,
							settings
						};
						await mountApplicationFrameLayout(store, props, config);

						const appFrame = query(ApplicationFrameMock).props();
						strictEqual(appFrame.subExpanded, true);
					});
				});

				describe("if initialSubExpanded is set to false in the ApplicationFrameLayout settings", () => {
					it("renders initially a collapsed sidebar", async () => {
						const store = createStoreForTest({
							appModel: modelForSidebar,
							initialState: {
								activities: {
									A: activityEnhancedSidebar
								}
							}
						});
						const settings: ApplicationModel.ApplicationFrame.Settings = {
							initialSubExpanded: false
						};
						const props: ApplicationFrameLayoutProps = {
							...customProps,
							settings
						};
						await mountApplicationFrameLayout(store, props, config);

						const appFrame = query(ApplicationFrameMock).props();
						strictEqual(appFrame.subExpanded, false);
					});
				});
			});

			describe("disableCollapsingSub", () => {
				it("sets disableCollapsingSub to false if it is not set or false in the application frame layout settings", async () => {
					const store = createStoreForTest({
						appModel: modelForSidebar,
						initialState: {
							activities: {
								A: activityNormalSidebar
							}
						}
					});
					await mountApplicationFrameLayout(store, customProps, config);

					const appFrameUpdated = query(ApplicationFrameMock).props();
					strictEqual(appFrameUpdated.disableCollapsingSub, false);
				});

				it("sets disableCollapsingSub to true if it is set to true in the application frame layout settings", async () => {
					const store = createStoreForTest({
						appModel: modelForSidebar,
						initialState: {
							activities: {
								A: activityEnhancedSidebar
							}
						}
					});
					const settings: ApplicationModel.ApplicationFrame.Settings = {
						disableCollapsingSub: true
					};
					const props: ApplicationFrameLayoutProps = {
						...customProps,
						settings
					};
					await mountApplicationFrameLayout(store, props, config);

					const appFrameUpdated = query(ApplicationFrameMock).props();
					strictEqual(appFrameUpdated.disableCollapsingSub, true);
				});
			});

			describe("subExpandedState", () => {
				describe("if initialSubExpandedState is not defined in the ApplicationFrameLayout settings", () => {
					it("renders initially an application frame where the subExpandedState is set to undefined", async () => {
						const store = createStoreForTest({
							appModel: modelForSidebar,
							initialState: {
								activities: {
									A: activityNormalSidebar
								}
							}
						});
						await mountApplicationFrameLayout(store, customProps, config);

						const appFrameUpdated = query(ApplicationFrameMock).props();
						strictEqual(appFrameUpdated.subExpandedState, undefined);
					});
				});

				describe("if initialSubExpandedState is set to minimized in the ApplicationFrameLayout settings", () => {
					it("renders initially an application frame where the subExpandedState is set to 'minimized'", async () => {
						const store = createStoreForTest({
							appModel: modelForSidebar,
							initialState: {
								activities: {
									A: activityEnhancedSidebar
								}
							}
						});
						const settings: ApplicationModel.ApplicationFrame.Settings = {
							initialSubExpandedState: "minimized"
						};
						const props: ApplicationFrameLayoutProps = {
							...customProps,
							settings
						};
						await mountApplicationFrameLayout(store, props, config);

						const appFrameUpdated = query(ApplicationFrameMock).props();
						strictEqual(appFrameUpdated.subExpandedState, "minimized");
					});

					it("maximizes the sub menu when setSubExpandedState is called with true and minimizes it when it is called with false", async () => {
						const store = createStoreForTest({
							appModel: modelForSidebar,
							initialState: {
								activities: {
									A: activityEnhancedSidebar
								}
							}
						});
						const settings: ApplicationModel.ApplicationFrame.Settings = {
							initialSubExpandedState: "minimized"
						};
						const propsWithSettings: ApplicationFrameLayoutProps = {
							...customProps,
							settings
						};

						const { MockRegionLayoutContent, layoutProvider } = addMockLayout(
							customProps.layoutProvider
						);

						const propsWithLayoutMock = {
							...propsWithSettings,
							layoutProvider
						};

						await mountApplicationFrameLayout(store, propsWithLayoutMock, config);
						const extendedSidebar = query(MockRegionLayoutContent).props();

						if (extendedSidebar.setSubExpandedState === undefined) {
							fail("Expected 'setSubExpandedState' in the sidebar context");
						}

						await act(() => extendedSidebar.setSubExpandedState?.("maximized"));

						let appFrameUpdated = query(ApplicationFrameMock).props();
						strictEqual(appFrameUpdated.subExpandedState, "maximized");

						await act(() => extendedSidebar.setSubExpandedState?.("minimized"));

						appFrameUpdated = query(ApplicationFrameMock).props();
						strictEqual(appFrameUpdated.subExpandedState, "minimized");
					});
				});

				describe("if initialSubExpandedState is set to maximized in the ApplicationFrameLayout settings", () => {
					it("renders initially an application frame where the subExpandedState is set to 'maximized'", async () => {
						const store = createStoreForTest({
							appModel: modelForSidebar,
							initialState: {
								activities: {
									A: activityEnhancedSidebar
								}
							}
						});
						const settings: ApplicationModel.ApplicationFrame.Settings = {
							initialSubExpandedState: "maximized"
						};
						const props: ApplicationFrameLayoutProps = {
							...customProps,
							settings
						};
						await mountApplicationFrameLayout(store, props, config);

						const appFrameUpdated = query(ApplicationFrameMock).props();
						strictEqual(appFrameUpdated.subExpandedState, "maximized");
					});
				});
			});
		};
	}

	function testContentArea(config: TestConfiguration) {
		const ContentLayoutMock: React.ComponentType<LayoutProps> = mock.fn(() => <div />);

		const customLayoutProvider = (name: string) => {
			return name === "MasterDetailMock"
				? { component: ContentLayoutMock }
				: LayoutProviderMock(name);
		};

		const customProps: LayoutProps = {
			regionReference: [],
			layoutProvider: customLayoutProvider,
			regionUiProvider: regionUiProviderMock,
			views: [],
			viewProvider: viewProviderMock,
			progressComponentProvider: progressComponentProviderMock
		};

		return () => {
			async function render(): Promise<LayoutProps> {
				const store = createStoreForTest({
					appModel: modelForApplicationFrame,
					initialState: { activities }
				});
				await mountApplicationFrameLayout(store, customProps, config);
				return query(ContentLayoutMock).props();
			}

			it("renders a content component with the CONTENT layout and the correct props", async () => {
				const content = await render();
				strictEqual(content.regionReference[0], "CONTENT");

				strictEqual(content.layoutProvider, customLayoutProvider);
				strictEqual(content.regionUiProvider.name, "regionUiProviderMock");
				strictEqual(content.viewProvider.name, "viewProviderMock");
			});
		};
	}

	async function mountApplicationFrameLayout(
		store: Store<object>,
		props: FrameViews.ApplicationFrameLayoutProps,
		config?: TestConfiguration
	): Promise<RenderResult> {
		return act(() =>
			render(
				<TestWrapper
					store={store}
					customWidgetMap={config?.customWidgetMap}
					sizeContextValue={{ currentSize: config?.smallDevice ? "sm" : undefined }}
					localizerContextValue={KEY_OUTPUT_LOCALIZER_CONTEXT}
				>
					<FrameViews.ApplicationFrameLayout
						{...props}
						views={[]}
						logoURL={logoURL}
						globalMessageBox={<Marker />}
					/>
				</TestWrapper>
			)
		);
	}

	function Marker(): JSX.Element {
		return <span data-testid="Marker" />;
	}

	function CustomComponent(): JSX.Element {
		return <div data-testid="CustomComponent" />;
	}

	function DummyComponent(props: MainMenuContextProps): JSX.Element {
		return <div />;
	}
}

function addMockLayout(chain: LayoutProvider) {
	const MockRegionLayoutContent: React.ComponentType<MockRegionLayoutContentProps> = mock.fn(() => (
		<div />
	));
	const layout = mockLayout(MockRegionLayoutContent);
	const layoutProvider: LayoutProvider = name => ("Mock" === name ? layout : chain(name));
	return { layoutProvider, MockRegionLayoutContent };
}
