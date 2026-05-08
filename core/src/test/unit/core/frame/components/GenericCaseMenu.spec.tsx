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

import { equal, ok, strictEqual } from "node:assert/strict";

import { fireEvent } from "@testing-library/react";
import type { Action } from "redux";

import { render, within } from "@com.mgmtp.a12.devtools/react";
import type { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";

import { ActivityActions } from "../../../../../core/activity/index.js";
import { GenericCaseMenu } from "../../../../../core/frame/internal/layout/ApplicationFrameLayout/generic-component.js";
import type { ApplicationModel } from "../../../../../core/model/index.js";
import { createActivity } from "../../../../utils/activity.js";
import {
	createAppModel,
	createContent,
	createModule,
	createRegion
} from "../../../../utils/appmodel-utils.js";
import { KEY_OUTPUT_LOCALIZER_CONTEXT } from "../../../../utils/localization.js";
import { TestWrapper } from "../../../../utils/rtl/testWrapper.js";

import { createStoreForTest, type MockStore } from "../utils.js";

describe("core.frame.internal.components.GenericCaseMenu", () => {
	it(
		"renders a generic view menu component with menu items " +
			"and dispatches a SET_CASE action when a menu item is clicked",
		() => {
			const { result, store } = renderMenu({ appModel: appModel({ cases }) });

			equal(setCase1Dispatched(store), false, "SET_CASE action dispatched too early");

			const menuItems = within(result.baseElement).getAllByRole("link");
			strictEqual(menuItems.length, 2);

			const case1 = within(result.baseElement).getByText("Case 1");
			fireEvent.click(case1);

			ok(setCase1Dispatched(store), "expected SET_CASE action");

			function setCase1Dispatched(store: MockStore): boolean {
				const isSetCase1 = (action: Action): boolean =>
					ActivityActions.setCase.match(action) && action.payload.case === "case1";
				return store.getActions().some(isSetCase1);
			}
		}
	);

	it("renders no view menu items when no cases are defined in the activity", () => {
		const { result } = renderMenu({ appModel: appModel({ cases: [] }) });
		const menuItems = within(result.baseElement).queryAllByRole("link");
		strictEqual(menuItems.length, 0);
	});

	it("localizes a generic view menu component by using the LocalizerContext infrastructure", () => {
		const { result } = renderMenu({
			localizerCtx: KEY_OUTPUT_LOCALIZER_CONTEXT,
			appModel: appModel({ cases })
		});

		const menuItems = within(result.baseElement).getAllByRole("link");
		strictEqual(menuItems.length, 2);

		within(result.baseElement).getByRole("link", {
			name: "application-model.TEST_MODEL.module1.flow1.scene1.case1"
		});

		within(result.baseElement).getByRole("link", {
			name: "application-model.TEST_MODEL.module1.flow1.scene1.case2"
		});
	});

	function renderMenu(opts: { appModel: ApplicationModel; localizerCtx?: LocalizerContext.Type }) {
		const activities = { A: createActivity({ id: "A" }) };
		const store = createStoreForTest({
			appModel: opts.appModel,
			initialState: { activities }
		});
		const result = render(
			<TestWrapper store={store} localizerContextValue={opts.localizerCtx}>
				<GenericCaseMenu name={"Test"} activityId={"A"} />
			</TestWrapper>
		);

		return {
			result,
			store
		};
	}

	function appModel(opts: { cases: ApplicationModel.Case[] }): ApplicationModel {
		return createAppModel({
			content: createContent({
				region: createRegion({}),
				modules: [
					createModule({
						flows: [
							{
								name: "flow1",
								scenes: [
									{
										name: "scene1",
										matchConditions: [],
										cases: opts.cases
									}
								]
							}
						]
					})
				]
			})
		});
	}

	const cases: ApplicationModel.Case[] = [
		{
			name: "case1",
			label: [
				{ locale: "en", text: "Case 1" },
				{ locale: "de", text: "Fall 1" }
			]
		},
		{
			name: "case2",
			label: [
				{ locale: "en", text: "Case 2" },
				{ locale: "de", text: "Fall 2" }
			]
		}
	];
});
