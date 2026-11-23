// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { ok, strictEqual } from "node:assert/strict";

import { within } from "@com.mgmtp.a12.devtools/react";

import StackRegionLayout from "../../../../../core/frame/internal/layout/StackRegionLayout.js";
import { modelForErrorBoundaries } from "../../../../mocks/frame/storeMocks.js";
import { createStoreForTest } from "../../../../unit/core/frame/utils.js";

import { activity, defaultProps, renderLayout } from "./helpers.js";

// stack layout shows only the last view, so we need a custom test here
export function describeStackRegionLayoutTests(): void {
	describe("Given two views", () => {
		it("renders an ErrorBoundary around each view", async () => {
			const store = createStoreForTest({ appModel: modelForErrorBoundaries });
			const result = await renderLayout(store, defaultProps, StackRegionLayout.component, activity);

			// Expect last view rendered (ViewB)
			const viewB = within(result.baseElement).getByDataTestId("ViewB");

			// wrapped in an ErrorBoundary
			const errorBoundaries = within(result.baseElement).getAllByDataTestId("ErrorBoundary");
			strictEqual(errorBoundaries.length, 1, "Expect an error boundary around each view");

			ok(
				viewB.closest('[data-testid="ErrorBoundary"]'),
				"Expect view B to be wrapped in an error boundary"
			);
		});
	});
}
