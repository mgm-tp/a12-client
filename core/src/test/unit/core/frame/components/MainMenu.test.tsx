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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import { deepStrictEqual, strictEqual } from "node:assert/strict";
import { mock, type Mock } from "node:test";

import { configure, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type { RefObject } from "react";
import { useEffect } from "react";
import type { Store } from "redux";

import type { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import type { Localizer } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";
import {
	defaultDataFormats,
	defaultValueConversion,
	localizableFromModel
} from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";
import type { FlyoutMenuProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/menu/main/flyout-menu.api.js";
import type { MenuItemType } from "@com.mgmtp.a12.widgets/widgets-core/lib/menu/main/menu.api.js";
import { isMenuItemList } from "@com.mgmtp.a12.widgets/widgets-core/lib/menu/main/menu.utils.js";

import { type ClientWidgetMap } from "../../../../../core/ClientWidgetMap.js";
import type { MainMenuProps } from "../../../../../core/frame/internal/components/MainMenu.js";
import MainMenu from "../../../../../core/frame/internal/components/MainMenu.js";
import type { ApplicationModel } from "../../../../../core/model/index.js";
import { modelForMainMenu } from "../../../../mocks/frame/storeMocks.js";
import { createAppModel, createContent, createModule } from "../../../../utils/appmodel-utils.js";
import { DE_LOCALE } from "../../../../utils/localization.js";
import { TestWrapper } from "../../../../utils/rtl/testWrapper.js";

import { createStoreForTest } from "../utils.js";

const FLYOUT_MENU_TEXT = "FlyoutMenu";
const SLIDING_MENU_WRAPPER_TEXT = "SlidingMenuWrapper";

describe("core.frame.internal.components.MainMenu", () => {
	configure({ testIdAttribute: "data-role" });

	describe("Localization", () => {
		let localizerContextValue: LocalizerContext.Type & { localizer: Mock<Localizer> };

		beforeEach(() => {
			const locale = DE_LOCALE;
			const dataFormats = defaultDataFormats(locale);
			const conversion = defaultValueConversion(dataFormats);
			localizerContextValue = { locale, dataFormats, localizer: mock.fn(), conversion };
		});

		it("localizes menu entries by using the LocalizerContext infrastructure", () => {
			const locale = DE_LOCALE;

			renderComponent({
				store: createStoreForTest({ appModel: modelForMainMenu, locale }),
				localizerContextValue
			});

			const localizerCalls = localizerContextValue.localizer.mock.calls;

			strictEqual(localizerCalls[0].arguments.length, 1);
			deepStrictEqual(
				localizerCalls[0].arguments[0],
				localizableFromModel(
					"application-model.TEST_MODEL.View1.1",
					modelForMainMenu.content.modules[0].menu?.label
				)
			);

			strictEqual(localizerCalls[1].arguments.length, 1);
			deepStrictEqual(
				localizerCalls[1].arguments[0],
				localizableFromModel(
					"application-model.TEST_MODEL.View2.2",
					modelForMainMenu.content.modules[1].menu?.label
				)
			);
		});
	});

	describe("Desktop", () => {
		it("renders a FlyoutMenu", () => {
			renderComponent({
				store: createStoreForTest({ appModel: modelForMainMenu }),
				mainMenuProps: {
					mobileMode: false
				}
			});

			const result = screen.queryAllByText(FLYOUT_MENU_TEXT);

			strictEqual(result.length, 1, "Expected to find a FlyoutMenu");
		});
	});

	describe("Mobile", () => {
		it("renders a SlidingMenu.MainWrapper", async () => {
			const { slidingPropsSpy } = renderComponent({
				store: createStoreForTest({ appModel: modelForMainMenu }),
				mainMenuProps: { mobileMode: true }
			});

			const result = screen.queryAllByText(SLIDING_MENU_WRAPPER_TEXT);

			strictEqual(result.length, 1, "Expected to find a SlidingMenu.MainWrapper");

			strictEqual(
				slidingPropsSpy.mock.calls[0].arguments[0].expanded,
				false,
				"initially collapsed"
			);
		});

		it("focuses the menu element wrapper when expanding", async () => {
			const focusSpy = mock.method(HTMLElement.prototype, "focus");

			const promise = handleAsyncBehavior<HTMLElement>(focusSpy);

			renderComponent({
				store: createStoreForTest({ appModel: modelForMainMenu }),
				mainMenuProps: { mobileMode: true, expanded: true },
				useRealWidgets: true
			});

			const el = await promise;
			strictEqual(el.getAttribute("data-role"), "menu");
		});

		it("calls the focus function of the trigger element if given", async () => {
			const user = userEvent.setup();

			const focusSpy = mock.fn();
			const triggerElement = {
				current: {
					focus: focusSpy
				}
			} as unknown as RefObject<HTMLElement | null>;

			renderComponent({
				store: createStoreForTest({ appModel: modelForMainMenu }),
				mainMenuProps: {
					mobileMode: true,
					expanded: true,
					triggerElement
				},
				useRealWidgets: true
			});

			focusSpy.mock.resetCalls();

			// wait for the wrapper to be focused after expansion
			const slidingMenuWrapper = screen.getByTestId("menu");
			await waitFor(() => strictEqual(document.activeElement?.id, slidingMenuWrapper.id));

			// Tab through the top level entries to trigger a tab out
			const numberOfVisibleTopLevelMenuEntries = modelForMainMenu.content.modules.filter(
				m => m.menu?.permission === undefined
			).length;
			const tabString = "{Tab}".repeat(numberOfVisibleTopLevelMenuEntries + 1);

			await user.keyboard(tabString);

			strictEqual(focusSpy.mock.callCount(), 1);
		});
	});

	describe("Items", () => {
		it("should set the menu name as item id for top level and child menu items", () => {
			const appModelWithMenus: ApplicationModel = createAppModel({
				content: createContent({
					modules: [
						createModule({ name: "module1", menu: { name: "module1-menu" } }),
						createModule({
							name: "module2",
							menu: { name: "module2-menu", children: [{ name: "module2-menu-child1-menu" }] }
						})
					]
				})
			});

			const expectedMenuProps: FlyoutMenuProps = {
				id: "main-menu",
				type: "horizontal",
				items: [
					{
						items: undefined,
						id: "module1-menu",
						label: "",
						onClick: undefined,
						selected: false
					},
					{
						items: [
							{
								items: undefined,
								id: "module2-menu-child1-menu",
								label: "",
								onClick: undefined,
								selected: false
							}
						],
						id: "module2-menu",
						label: "",
						onClick: undefined,
						selected: false
					}
				],
				useAs: "main"
			};

			const { flyoutPropsSpy } = renderComponent({
				store: createStoreForTest({ appModel: appModelWithMenus }),
				mainMenuProps: { id: "main-menu" }
			});

			deepStrictEqual(flyoutPropsSpy.mock.calls[0].arguments[0], expectedMenuProps);
		});
	});

	describe("Permissions", () => {
		function addLabel(menu: ApplicationModel.Menu): ApplicationModel.Menu {
			return {
				...menu,
				label: menu.label ?? [{ locale: "en", text: menu.name }],
				children: menu.children?.map(addLabel)
			};
		}

		function createAppModelWithMenus(moduleMenus: ApplicationModel.Menu[]): ApplicationModel {
			return createAppModel({
				content: createContent({
					modules: moduleMenus.map(menu =>
						createModule({
							menu: addLabel(menu)
						})
					)
				})
			});
		}

		function flattenMenuItems(items: MenuItemType[]): string[] {
			return isMenuItemList(items)
				? items.flatMap(item => [item.label as string, ...flattenMenuItems(item.items ?? [])])
				: [];
		}

		describe("without permissions", () => {
			describe("and an appmodel with only top-level menus", () => {
				it("renders only the menu entries with empty permission", () => {
					const appModel = createAppModelWithMenus([
						{ name: "noPermission" },
						{ name: "emptyPermission", permission: "" },
						{ name: "permissionA", permission: "A" },
						{ name: "multiplePermission", permission: "A,B" }
					]);

					const { flyoutPropsSpy } = renderComponent({
						store: createStoreForTest({ appModel: appModel })
					});

					const menuItems = flyoutPropsSpy.mock.calls[0].arguments[0].items;
					deepStrictEqual(flattenMenuItems(menuItems), ["noPermission", "emptyPermission"]);
				});
			});

			describe("and an appmodel with child menus", () => {
				it("renders only the menu entries with empty permission", () => {
					const appModel = createAppModelWithMenus([
						{
							name: "noPermission",
							children: [
								{ name: "noPermission1" },
								{ name: "emptyPermission1", permission: "" },
								{ name: "permissionA1", permission: "A" },
								{ name: "multiplePermission1", permission: "A,B" }
							]
						},
						{
							name: "emptyPermission",
							children: [
								{ name: "noPermission2" },
								{ name: "emptyPermission2", permission: "" },
								{ name: "permissionA2", permission: "A" },
								{ name: "multiplePermission2", permission: "A,B" }
							],
							permission: ""
						},
						{
							name: "permissionA",
							children: [
								{ name: "noPermission3" },
								{ name: "emptyPermission3", permission: "" },
								{ name: "permissionA3", permission: "A" },
								{ name: "multiplePermission3", permission: "A,B" }
							],
							permission: "A"
						}
					]);

					const { flyoutPropsSpy } = renderComponent({
						store: createStoreForTest({ appModel: appModel })
					});

					const menuItems = flyoutPropsSpy.mock.calls[0].arguments[0].items;

					deepStrictEqual(flattenMenuItems(menuItems), [
						"noPermission",
						"noPermission1",
						"emptyPermission1",
						"emptyPermission",
						"noPermission2",
						"emptyPermission2"
					]);
				});
			});

			describe("and an appmodel with nested child menus", () => {
				it("renders only the menu entries with empty permission", () => {
					const appModel = createAppModelWithMenus([
						{
							name: "noPermission",
							children: [
								{
									name: "noPermission1",
									children: [
										{ name: "noPermission1-1" },
										{ name: "emptyPermission1-1", permission: "" },
										{ name: "permissionA1-1", permission: "A" },
										{ name: "multiplePermission1", permission: "A,B" }
									]
								},
								{
									name: "emptyPermission1",
									children: [
										{ name: "noPermission1-2" },
										{ name: "emptyPermission1-2", permission: "" },
										{ name: "permissionA1-2", permission: "A" },
										{ name: "multiplePermission2", permission: "A,B" }
									],
									permission: ""
								}
							]
						},
						{
							name: "emptyPermission",
							children: [
								{
									name: "noPermission2",
									children: [
										{ name: "noPermission2-1" },
										{ name: "emptyPermission2-1", permission: "" },
										{ name: "permissionA2-1", permission: "A" },
										{ name: "multiplePermission1", permission: "A,B" }
									]
								},
								{
									name: "emptyPermission2",
									children: [
										{ name: "noPermission2-2" },
										{ name: "emptyPermission2-2", permission: "" },
										{ name: "permissionA2-2", permission: "A" },
										{ name: "multiplePermission2", permission: "A,B" }
									],
									permission: ""
								}
							],
							permission: ""
						}
					]);

					const { flyoutPropsSpy } = renderComponent({
						store: createStoreForTest({ appModel: appModel })
					});

					const menuItems = flyoutPropsSpy.mock.calls[0].arguments[0].items;

					deepStrictEqual(flattenMenuItems(menuItems), [
						"noPermission",
						"noPermission1",
						"noPermission1-1",
						"emptyPermission1-1",
						"emptyPermission1",
						"noPermission1-2",
						"emptyPermission1-2",
						"emptyPermission",
						"noPermission2",
						"noPermission2-1",
						"emptyPermission2-1",
						"emptyPermission2",
						"noPermission2-2",
						"emptyPermission2-2"
					]);
				});
			});
		});

		describe("given a single permission", () => {
			const PERMISSIONS = ["A"];

			describe("and an appmodel with only top-level menus", () => {
				it("renders only the menu entries matching the permission or with empty permission", () => {
					const appModel = createAppModelWithMenus([
						{ name: "noPermission" },
						{ name: "emptyPermission", permission: "" },
						{ name: "matchingPermission", permission: "A" },
						{ name: "notMatchingPermission", permission: "B" },
						{ name: "matchingPermissionMultiple", permission: "A,B" },
						{ name: "notMatchingPermissionMultiple", permission: "B,C" }
					]);

					const { flyoutPropsSpy } = renderComponent({
						store: createStoreForTest({ appModel: appModel }),
						mainMenuProps: {
							permissions: PERMISSIONS
						}
					});

					const menuItems = flyoutPropsSpy.mock.calls[0].arguments[0].items;

					deepStrictEqual(flattenMenuItems(menuItems), [
						"noPermission",
						"emptyPermission",
						"matchingPermission",
						"matchingPermissionMultiple"
					]);
				});
			});

			describe("and an appmodel with child menus", () => {
				it("renders only the menu entries matching the permission or with empty permission", () => {
					const appModel = createAppModelWithMenus([
						{
							name: "matchingPermission",
							children: [
								{ name: "noPermission3" },
								{ name: "emptyPermission3", permission: "" },
								{ name: "matchingPermission3", permission: "A" },
								{ name: "notMatchingPermission3", permission: "B" },
								{ name: "matchingPermissionMultiple3", permission: "A,B" },
								{ name: "notMatchingPermissionMultiple3", permission: "B,C" }
							],
							permission: "A"
						},
						{
							name: "notMatchingPermission",
							children: [
								{ name: "noPermission4" },
								{ name: "emptyPermission4", permission: "" },
								{ name: "matchingPermission4", permission: "A" },
								{ name: "notMatchingPermission4", permission: "B" },
								{ name: "matchingPermissionMultiple4", permission: "A,B" },
								{ name: "notMatchingPermissionMultiple4", permission: "B,C" }
							],
							permission: "B"
						}
					]);

					const { flyoutPropsSpy } = renderComponent({
						store: createStoreForTest({ appModel: appModel }),
						mainMenuProps: {
							permissions: PERMISSIONS
						}
					});

					const menuItems = flyoutPropsSpy.mock.calls[0].arguments[0].items;

					deepStrictEqual(flattenMenuItems(menuItems), [
						"matchingPermission",
						"noPermission3",
						"emptyPermission3",
						"matchingPermission3",
						"matchingPermissionMultiple3"
					]);
				});

				it("renders menu entry where all children do not match the permission but there is an activityDescriptor ", () => {
					const appModel = createAppModelWithMenus([
						{
							name: "matchingPermission",
							children: [
								{ name: "notMatchingChild1", permission: "B" },
								{ name: "notMatchingChild2", permission: "B" },
								{ name: "notMatchingChild3", permission: "B" },
								{ name: "notMatchingChild4", permission: "B" }
							],
							initialActivity: { descriptor: { key: "value" } },
							permission: "A"
						}
					]);

					const { flyoutPropsSpy } = renderComponent({
						store: createStoreForTest({ appModel: appModel }),
						mainMenuProps: {
							permissions: PERMISSIONS
						}
					});

					const menuItems = flyoutPropsSpy.mock.calls[0].arguments[0].items;

					deepStrictEqual(flattenMenuItems(menuItems), ["matchingPermission"]);
				});

				it("does not render menu entry where all children do not match the permission and there is no activityDescriptor ", () => {
					const appModel = createAppModelWithMenus([
						{
							name: "matchingPermission",
							children: [
								{ name: "notMatchingChild1", permission: "B" },
								{ name: "notMatchingChild2", permission: "B" },
								{ name: "notMatchingChild3", permission: "B" },
								{ name: "notMatchingChild4", permission: "B" }
							],
							permission: "A"
						}
					]);

					const { flyoutPropsSpy } = renderComponent({
						store: createStoreForTest({ appModel: appModel }),
						mainMenuProps: {
							permissions: PERMISSIONS
						}
					});

					const menuItems = flyoutPropsSpy.mock.calls[0].arguments[0].items;

					deepStrictEqual(flattenMenuItems(menuItems), []);
				});
			});

			describe("and an appmodel with nested child menus", () => {
				it("renders only the menu entries matching the permission or with empty permission", () => {
					const appModel = createAppModelWithMenus([
						{
							name: "noPermission",
							children: [
								{
									name: "matchingPermission1",
									children: [
										{ name: "noPermission1-1" },
										{ name: "emptyPermission1-1", permission: "" },
										{ name: "matchingPermission1-1", permission: "A" },
										{ name: "notMatchingPermission1-1", permission: "B" },
										{ name: "matchingPermissionMultiple1-1", permission: "A,B" },
										{ name: "notMatchingPermissionMultiple1-1", permission: "B,C" }
									],
									permission: "A"
								}
							]
						},
						{
							name: "emptyPermission",
							children: [
								{
									name: "matchingPermission2",
									children: [
										{ name: "noPermission2-1" },
										{ name: "emptyPermission2-1", permission: "" },
										{ name: "matchingPermission2-1", permission: "A" },
										{ name: "notMatchingPermission2-1", permission: "B" },
										{ name: "matchingPermissionMultiple2-1", permission: "A,B" },
										{ name: "notMatchingPermissionMultiple2-1", permission: "B,C" }
									],
									permission: "A"
								}
							],
							permission: ""
						},
						{
							name: "matchingPermission",
							children: [
								{
									name: "matchingPermission3",
									children: [
										{ name: "noPermission3-1" },
										{ name: "emptyPermission3-1", permission: "" },
										{ name: "matchingPermission3-1", permission: "A" },
										{ name: "notMatchingPermission3-1", permission: "B" },
										{ name: "matchingPermissionMultiple3-1", permission: "A,B" },
										{ name: "notMatchingPermissionMultiple3-1", permission: "B,C" }
									],
									permission: "A"
								}
							],
							permission: "A"
						}
					]);

					const { flyoutPropsSpy } = renderComponent({
						store: createStoreForTest({ appModel: appModel }),
						mainMenuProps: {
							permissions: PERMISSIONS
						}
					});

					const menuItems = flyoutPropsSpy.mock.calls[0].arguments[0].items;

					deepStrictEqual(flattenMenuItems(menuItems), [
						"noPermission",
						"matchingPermission1",
						"noPermission1-1",
						"emptyPermission1-1",
						"matchingPermission1-1",
						"matchingPermissionMultiple1-1",
						"emptyPermission",
						"matchingPermission2",
						"noPermission2-1",
						"emptyPermission2-1",
						"matchingPermission2-1",
						"matchingPermissionMultiple2-1",
						"matchingPermission",
						"matchingPermission3",
						"noPermission3-1",
						"emptyPermission3-1",
						"matchingPermission3-1",
						"matchingPermissionMultiple3-1"
					]);
				});

				it("renders a nested menu entry where all children do not match the permission but there is an activityDescriptor ", () => {
					const appModel = createAppModelWithMenus([
						{
							name: "matchingPermission",
							children: [
								{
									name: "matchingChild",
									children: [
										{ name: "notMatching1", permission: "B" },
										{ name: "notMatching2", permission: "B" },
										{ name: "notMatching3", permission: "B" },
										{ name: "notMatching4", permission: "B" }
									],
									initialActivity: { descriptor: { key: "value" } },
									permission: "A"
								},
								{
									name: "otherMatchingChild",
									permission: "A"
								}
							],
							permission: "A"
						}
					]);

					const { flyoutPropsSpy } = renderComponent({
						store: createStoreForTest({ appModel: appModel }),
						mainMenuProps: {
							permissions: PERMISSIONS
						}
					});

					const menuItems = flyoutPropsSpy.mock.calls[0].arguments[0].items;

					deepStrictEqual(flattenMenuItems(menuItems), [
						"matchingPermission",
						"matchingChild",
						"otherMatchingChild"
					]);
				});

				it("does not render a nested menu entry where all children do not match the permission and there is no activityDescriptor ", () => {
					const appModel = createAppModelWithMenus([
						{
							name: "matchingPermission",
							children: [
								{
									name: "matchingChild",
									children: [
										{ name: "notMatching1", permission: "B" },
										{ name: "notMatching2", permission: "B" },
										{ name: "notMatching3", permission: "B" },
										{ name: "notMatching4", permission: "B" }
									],
									permission: "A"
								},
								{
									name: "otherMatchingChild",
									permission: "A"
								}
							],
							permission: "A"
						}
					]);

					const { flyoutPropsSpy } = renderComponent({
						store: createStoreForTest({ appModel: appModel }),
						mainMenuProps: {
							permissions: PERMISSIONS
						}
					});

					const menuItems = flyoutPropsSpy.mock.calls[0].arguments[0].items;

					deepStrictEqual(flattenMenuItems(menuItems), [
						"matchingPermission",
						"otherMatchingChild"
					]);
				});
			});
		});

		describe("given multiple permissions", () => {
			const PERMISSIONS = ["A", "B"];

			describe("and an appmodel with only top-level menus", () => {
				it("renders only the menu entries matching the permission or with empty permission", () => {
					const appModel = createAppModelWithMenus([
						{ name: "noPermission" },
						{ name: "matchingPermissionA", permission: "A" },
						{ name: "matchingPermissionB", permission: "B" },
						{ name: "notMatchingPermission", permission: "C" },
						{ name: "matchingPermissionMultipleAB", permission: "A,B" },
						{ name: "matchingPermissionMultipleBC", permission: "B,C" },
						{ name: "matchingPermissionMultipleAC", permission: "A,C" },
						{ name: "notMatchingMultiple", permission: "C,D" }
					]);

					const { flyoutPropsSpy } = renderComponent({
						store: createStoreForTest({ appModel: appModel }),
						mainMenuProps: {
							permissions: PERMISSIONS
						}
					});

					const menuItems = flyoutPropsSpy.mock.calls[0].arguments[0].items;

					deepStrictEqual(flattenMenuItems(menuItems), [
						"noPermission",
						"matchingPermissionA",
						"matchingPermissionB",
						"matchingPermissionMultipleAB",
						"matchingPermissionMultipleBC",
						"matchingPermissionMultipleAC"
					]);
				});
			});

			describe("and an appmodel with child menus", () => {
				it("renders only the menu entries matching the permission or with empty permission", () => {
					const appModel = createAppModelWithMenus([
						{
							name: "noPermission",
							children: [
								{ name: "noPermission1" },
								{ name: "matchingPermissionA1", permission: "A" },
								{ name: "matchingPermissionB1", permission: "B" },
								{ name: "notMatchingPermission1", permission: "C" },
								{ name: "matchingPermissionMultipleAB1", permission: "A,B" },
								{ name: "matchingPermissionMultipleBC1", permission: "B,C" },
								{ name: "matchingPermissionMultipleAC1", permission: "A,C" },
								{ name: "notMatchingMultiple1", permission: "C,D" }
							]
						},
						{
							name: "matchingPermissionA",
							children: [
								{ name: "noPermission2" },
								{ name: "matchingPermissionA2", permission: "A" },
								{ name: "matchingPermissionB2", permission: "B" },
								{ name: "notMatchingPermission2", permission: "C" },
								{ name: "matchingPermissionMultipleAB2", permission: "A,B" },
								{ name: "matchingPermissionMultipleBC2", permission: "B,C" },
								{ name: "matchingPermissionMultipleAC2", permission: "A,C" },
								{ name: "notMatchingMultiple2", permission: "C,D" }
							],
							permission: "A"
						},
						{
							name: "matchingPermissionB",
							children: [
								{ name: "noPermission3" },
								{ name: "matchingPermissionA3", permission: "A" },
								{ name: "matchingPermissionB3", permission: "B" },
								{ name: "notMatchingPermission3", permission: "C" },
								{ name: "matchingPermissionMultipleAB3", permission: "A,B" },
								{ name: "matchingPermissionMultipleBC3", permission: "B,C" },
								{ name: "matchingPermissionMultipleAC3", permission: "A,C" },
								{ name: "notMatchingMultiple3", permission: "C,D" }
							],
							permission: "B"
						},
						{
							name: "notMatchingPermission",
							children: [
								{ name: "noPermission4" },
								{ name: "matchingPermissionA4", permission: "A" },
								{ name: "matchingPermissionB4", permission: "B" },
								{ name: "notMatchingPermission4", permission: "C" },
								{ name: "matchingPermissionMultipleAB4", permission: "A,B" },
								{ name: "matchingPermissionMultipleBC4", permission: "B,C" },
								{ name: "matchingPermissionMultipleAC4", permission: "A,C" },
								{ name: "notMatchingMultiple4", permission: "C,D" }
							],
							permission: "C"
						}
					]);

					const { flyoutPropsSpy } = renderComponent({
						store: createStoreForTest({ appModel: appModel }),
						mainMenuProps: {
							permissions: PERMISSIONS
						}
					});

					const menuItems = flyoutPropsSpy.mock.calls[0].arguments[0].items;

					deepStrictEqual(flattenMenuItems(menuItems), [
						"noPermission",
						"noPermission1",
						"matchingPermissionA1",
						"matchingPermissionB1",
						"matchingPermissionMultipleAB1",
						"matchingPermissionMultipleBC1",
						"matchingPermissionMultipleAC1",
						"matchingPermissionA",
						"noPermission2",
						"matchingPermissionA2",
						"matchingPermissionB2",
						"matchingPermissionMultipleAB2",
						"matchingPermissionMultipleBC2",
						"matchingPermissionMultipleAC2",
						"matchingPermissionB",
						"noPermission3",
						"matchingPermissionA3",
						"matchingPermissionB3",
						"matchingPermissionMultipleAB3",
						"matchingPermissionMultipleBC3",
						"matchingPermissionMultipleAC3"
					]);
				});
			});

			describe("and an appmodel with nested child menus", () => {
				it("renders only the menu entries matching the permission or with empty permission", () => {
					const appModel = createAppModelWithMenus([
						{
							name: "matchingPermissionA",
							children: [
								{
									name: "matchingPermissionA1",
									children: [
										{ name: "noPermissionA1-1" },
										{ name: "matchingPermissionA1-1", permission: "A" },
										{ name: "matchingPermissionB1-1", permission: "B" },
										{ name: "notMatchingPermissionA1-1", permission: "C" },
										{ name: "matchingPermissionMultipleAB1-1", permission: "A,B" },
										{ name: "matchingPermissionMultipleBC1-1", permission: "B,C" },
										{ name: "matchingPermissionMultipleAC1-1", permission: "A,C" },
										{ name: "notMatchingMultipleA1-1", permission: "C,D" }
									],
									permission: "A"
								},
								{
									name: "matchingPermissionB1",
									children: [
										{ name: "noPermissionB1-1" },
										{ name: "matchingPermissionA1-2", permission: "A" },
										{ name: "matchingPermissionB1-2", permission: "B" },
										{ name: "notMatchingPermissionB1-1", permission: "C" },
										{ name: "matchingPermissionMultipleAB1-2", permission: "A,B" },
										{ name: "matchingPermissionMultipleBC1-2", permission: "B,C" },
										{ name: "matchingPermissionMultipleAC1-2", permission: "A,C" },
										{ name: "notMatchingMultipleB1-1", permission: "C,D" }
									],
									permission: "B"
								}
							],
							permission: "A"
						},
						{
							name: "matchingPermissionB",
							children: [
								{
									name: "matchingPermissionA2",
									children: [
										{ name: "noPermissionA2-1" },
										{ name: "matchingPermissionA2-1", permission: "A" },
										{ name: "matchingPermissionB2-1", permission: "B" },
										{ name: "notMatchingPermissionA2-1", permission: "C" },
										{ name: "matchingPermissionMultipleAB2-1", permission: "A,B" },
										{ name: "matchingPermissionMultipleBC2-1", permission: "B,C" },
										{ name: "matchingPermissionMultipleAC2-1", permission: "A,C" },
										{ name: "notMatchingMultipleA2-1", permission: "C,D" }
									],
									permission: "A"
								},
								{
									name: "matchingPermissionB2",
									children: [
										{ name: "noPermissionB2-1" },
										{ name: "matchingPermissionA2-2", permission: "A" },
										{ name: "matchingPermissionB2-2", permission: "B" },
										{ name: "notMatchingPermissionB2-1", permission: "C" },
										{ name: "matchingPermissionMultipleAB2-2", permission: "A,B" },
										{ name: "matchingPermissionMultipleBC2-2", permission: "B,C" },
										{ name: "matchingPermissionMultipleAC2-2", permission: "A,C" },
										{ name: "notMatchingMultipleB2-1", permission: "C,D" }
									],
									permission: "B"
								}
							],
							permission: "B"
						}
					]);

					const { flyoutPropsSpy } = renderComponent({
						store: createStoreForTest({ appModel: appModel }),
						mainMenuProps: {
							permissions: PERMISSIONS
						}
					});

					const menuItems = flyoutPropsSpy.mock.calls[0].arguments[0].items;

					deepStrictEqual(flattenMenuItems(menuItems), [
						"matchingPermissionA",
						"matchingPermissionA1",
						"noPermissionA1-1",
						"matchingPermissionA1-1",
						"matchingPermissionB1-1",
						"matchingPermissionMultipleAB1-1",
						"matchingPermissionMultipleBC1-1",
						"matchingPermissionMultipleAC1-1",
						"matchingPermissionB1",
						"noPermissionB1-1",
						"matchingPermissionA1-2",
						"matchingPermissionB1-2",
						"matchingPermissionMultipleAB1-2",
						"matchingPermissionMultipleBC1-2",
						"matchingPermissionMultipleAC1-2",
						"matchingPermissionB",
						"matchingPermissionA2",
						"noPermissionA2-1",
						"matchingPermissionA2-1",
						"matchingPermissionB2-1",
						"matchingPermissionMultipleAB2-1",
						"matchingPermissionMultipleBC2-1",
						"matchingPermissionMultipleAC2-1",
						"matchingPermissionB2",
						"noPermissionB2-1",
						"matchingPermissionA2-2",
						"matchingPermissionB2-2",
						"matchingPermissionMultipleAB2-2",
						"matchingPermissionMultipleBC2-2",
						"matchingPermissionMultipleAC2-2"
					]);
				});
			});
		});
	});
});

function renderComponent(options?: {
	mainMenuProps?: Partial<MainMenuProps>;
	store?: Store<object>;
	localizerContextValue?: LocalizerContext.Type;
	useRealWidgets?: boolean;
}) {
	const { mainMenuProps, store, localizerContextValue, useRealWidgets } = options ?? {};

	const slidingPropsSpy = mock.fn();
	const flyoutPropsSpy = mock.fn();

	const customWidgetMap = {
		FlyoutMenu: createFakeComponent(FLYOUT_MENU_TEXT, flyoutPropsSpy),
		SlidingMenuWrapper: createFakeComponent(SLIDING_MENU_WRAPPER_TEXT, slidingPropsSpy)
	} satisfies Partial<ClientWidgetMap>;

	render(
		<TestWrapper
			store={store}
			localizerContextValue={localizerContextValue}
			customWidgetMap={useRealWidgets ? undefined : customWidgetMap}
		>
			<MainMenu {...createMainMenuProps(mainMenuProps)}></MainMenu>
		</TestWrapper>
	);

	return { slidingPropsSpy, flyoutPropsSpy };
}

function createMainMenuProps(options?: {
	id?: string;
	mobileMode?: boolean;
	expanded?: boolean;
	permissions?: string[];
	triggerElement?: RefObject<HTMLElement | null>;
}): MainMenuProps {
	return {
		id: options?.id,
		mobileMode: options?.mobileMode ?? false,
		onMenuItemClick: mock.fn(),
		expanded: options?.expanded ?? false,
		permissions: options?.permissions ?? [],
		triggerElement: options?.triggerElement
	};
}

function handleAsyncBehavior<T>(focusSpy: Mock<(opts: FocusOptions) => void>): Promise<T> {
	return Promise.race([
		new Promise<T>((_, reject) => {
			setTimeout(() => reject(new Error("Test exceeded async timeout of 3s")), 3000);
		}),
		new Promise<T>(resolve => {
			focusSpy.mock.mockImplementationOnce(function (this: T) {
				resolve(this);
			});
		})
	]);
}

function createFakeComponent(text: string, propsSpy?: Mock<(props: unknown) => void>) {
	return (props: unknown) => {
		// eslint-disable-next-line useEffectNoDeps/use-effect-no-deps
		useEffect(() => (propsSpy ? propsSpy(props) : undefined));
		return <div>{text}</div>;
	};
}
