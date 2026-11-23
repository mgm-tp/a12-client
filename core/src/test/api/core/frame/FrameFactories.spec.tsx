// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual, throws } from "node:assert/strict";

import { FrameFactories } from "../../../../core/frame/index.js";
import { ErrorBoundary } from "../../../../core/frame/internal/components/error-boundary/ErrorBoundary.js";
import ApplicationFrameLayout from "../../../../core/frame/internal/layout/ApplicationFrameLayout.js";
import { GenericCaseMenu } from "../../../../core/frame/internal/layout/ApplicationFrameLayout/generic-component.js";
import DashboardRegionLayout from "../../../../core/frame/internal/layout/DashboardLayout.js";
import { DefaultRegionUi } from "../../../../core/frame/internal/layout/DefaultRegionUi.js";
import MasterDetailRegionLayout from "../../../../core/frame/internal/layout/MasterDetailRegionLayout.js";
import { ModalRegionUi } from "../../../../core/frame/internal/layout/ModalRegionUi.js";
import NullRegionLayout from "../../../../core/frame/internal/layout/NullRegionLayout.js";
import StackRegionLayout from "../../../../core/frame/internal/layout/StackRegionLayout.js";

/**
 * Only tests FrameFactories - for the components themselves see their own tests
 * in src/test/unit/core/frame/components.
 */
describe("core.frame.FrameFactories", () => {
	describe("RegionUiProvider", () => {
		it("returns DefaultRegionUi, when the regionReference is MODAL", () => {
			strictEqual(FrameFactories.regionUiProvider(["NOT_MODAL"]), DefaultRegionUi);
		});

		it("returns ModalRegionUi, when the regionReference is MODAL", () => {
			strictEqual(FrameFactories.regionUiProvider(["MODAL"]), ModalRegionUi);
		});
	});

	describe("LayoutProvider", () => {
		it("provides a ReactComponent which renders ApplicationFrame widget, when the parameter is ApplicationFrame", () => {
			strictEqual(FrameFactories.layoutProvider("ApplicationFrame"), ApplicationFrameLayout);
		});

		it("provides a ReactComponent that renders all views in a sequence to the DOM, when the parameter is Null", () => {
			strictEqual(FrameFactories.layoutProvider("Null"), NullRegionLayout);
		});

		it("provides a ReactComponent which renders the views in a MasterDetail widget, when the parameter is MasterDetail", () => {
			strictEqual(FrameFactories.layoutProvider("MasterDetail"), MasterDetailRegionLayout);
		});

		it("provides a ReactComponent which renders only the last view to the DOM, when the parameter is Stack", () => {
			strictEqual(FrameFactories.layoutProvider("Stack"), StackRegionLayout);
		});

		it("provides a ReactComponent which renders the views in a Dashboard widget, when the parameter is Dashboard", () => {
			strictEqual(FrameFactories.layoutProvider("Dashboard"), DashboardRegionLayout);
		});

		it("throws an error, when the layout is not known", () => {
			throws(
				() => FrameFactories.layoutProvider("WRONG-LAYOUT"),
				new Error("unknown layout WRONG-LAYOUT")
			);
		});
	});

	describe("viewProvider", () => {
		describe("called with 'GenericCaseMenu'", () => {
			it("renders a generic view menu component", () => {
				strictEqual(FrameFactories.viewProvider("GenericCaseMenu"), GenericCaseMenu);
			});
		});
	});

	describe("errorBoundaryProvider", () => {
		it("returns the default ErrorBoundary", () => {
			strictEqual(FrameFactories.errorBoundaryProvider(), ErrorBoundary);
		});
	});
});
