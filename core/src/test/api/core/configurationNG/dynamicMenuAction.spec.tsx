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

import { notStrictEqual, ok } from "node:assert/strict";

import { act, type JSX, type SyntheticEvent } from "react";

import { render } from "@com.mgmtp.a12.devtools/react";
import type { FlyoutMenuProps, MenuItem } from "@com.mgmtp.a12.widgets/widgets-core";

import { ActivityActions, ActivitySelectors } from "../../../../core/activity/index.js";
import {
	ModuleRegistryProvider,
	ModuleTestExtensions
} from "../../../../core/application/index.js";
import type { DynamicMenu } from "../../../../core/configurationNG/index.js";
import { DynamicMainMenu } from "../../../../core/frame/internal/components/DynamicMainMenu.js";
import { TestWrapper } from "../../../utils/rtl/testWrapper.js";
import { createApplicationSetup } from "../../../utils/test-utils.js";

function menuActionModule() {
	const MENUS: DynamicMenu[] = [
		{
			id: "objectAction",
			label: { key: "menu.object", defaults: { en: "Object" } },
			action: ActivityActions.create({
				activityId: "menu-object",
				activityDescriptor: { test: "menu" },
				loadingState: "without"
			})
		},
		{
			id: "callbackAction",
			label: { key: "menu.callback", defaults: { en: "Callback" } },
			action: dispatch =>
				dispatch(
					ActivityActions.create({
						activityId: "menu-callback",
						activityDescriptor: { test: "menu" },
						loadingState: "without"
					})
				)
		}
	];

	return { id: "menuActionTest", menus: () => MENUS };
}

function createFlyoutMenuSpy() {
	const captured: { items: MenuItem[] } = { items: [] };

	function FlyoutMenuSpy(props: FlyoutMenuProps): JSX.Element {
		captured.items = props.items as MenuItem[];
		return <div data-testid="FlyoutMenuSpy" />;
	}

	return { captured, FlyoutMenuSpy };
}

function noop(): void {
	// menu item clicks are triggered directly on the captured items
}

async function renderMenuWithModule() {
	const { store } = createApplicationSetup();
	const { captured, FlyoutMenuSpy } = createFlyoutMenuSpy();

	await act(() => ModuleRegistryProvider.getInstance().addModule(menuActionModule()));
	await act(() =>
		render(
			<TestWrapper store={store} customWidgetMap={{ FlyoutMenu: FlyoutMenuSpy }}>
				<DynamicMainMenu mobileMode={false} expanded={false} onMenuItemClick={noop} />
			</TestWrapper>
		)
	);

	return { store, captured };
}

async function clickMenuItem(captured: { items: MenuItem[] }, id: string): Promise<void> {
	const item = captured.items.find(menuItem => menuItem.id === id);
	ok(item?.onClick, `menu item "${id}" should have an onClick handler`);
	await act(() => item.onClick?.({} as SyntheticEvent<HTMLElement>));
}

describe("core.configurationNG.dynamicMenuAction", () => {
	afterEach(async () => {
		await ModuleTestExtensions.reset();
	});

	it("dispatches a plain action object contributed as menu action", async () => {
		const { store, captured } = await renderMenuWithModule();

		await clickMenuItem(captured, "objectAction");

		notStrictEqual(ActivitySelectors.activityById("menu-object")(store.getState()), undefined);
	});

	it("still invokes callback menu actions with dispatch", async () => {
		const { store, captured } = await renderMenuWithModule();

		await clickMenuItem(captured, "callbackAction");

		notStrictEqual(ActivitySelectors.activityById("menu-callback")(store.getState()), undefined);
	});
});
