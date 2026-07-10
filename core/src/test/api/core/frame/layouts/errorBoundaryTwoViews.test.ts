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

import { within } from "@com.mgmtp.a12.devtools/react";

import type { LayoutProps } from "../../../../../core/frame/internal/layout/LayoutProps.js";
import { modelForErrorBoundaries } from "../../../../mocks/frame/storeMocks.js";
import { createStoreForTest } from "../../../../unit/core/frame/utils.js";

import { activity, defaultProps, renderLayout } from "./helpers.js";

export function describeErrorBoundaryTestWithTwoViews(
	layout: React.ComponentType<LayoutProps>,
	settings?: object
): void {
	describe("Given two views", () => {
		it("renders an ErrorBoundary around each view", async () => {
			const store = createStoreForTest({ appModel: modelForErrorBoundaries });
			const result = await renderLayout(store, defaultProps, layout, activity, settings);

			// Expect two views rendered (ViewA and ViewB)
			const viewA = within(result.baseElement).getByDataTestId("ViewA");
			const viewB = within(result.baseElement).getByDataTestId("ViewB");

			// Each should be wrapped in an ErrorBoundary
			const errorBoundaries = within(result.baseElement).getAllByDataTestId("ErrorBoundary");
			strictEqual(errorBoundaries.length, 2, "Expect an error boundary around each view");

			ok(
				viewA.closest('[data-testid="ErrorBoundary"]'),
				"Expect view A to be wrapped in an error boundary"
			);
			ok(
				viewB.closest('[data-testid="ErrorBoundary"]'),
				"Expect view B to be wrapped in an error boundary"
			);
		});
	});
}
