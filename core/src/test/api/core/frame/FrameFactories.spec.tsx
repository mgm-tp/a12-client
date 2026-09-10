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
