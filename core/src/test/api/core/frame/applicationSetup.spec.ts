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

import { equal } from "node:assert/strict";
import { mock } from "node:test";

import {
	foldLayoutModifications,
	foldViewModifications
} from "../../../../core/frame/internal/applicationSetup.js";
import type { Layout } from "../../../../core/frame/internal/layout/LayoutProps.js";
import type { View } from "../../../../core/view/internal/view.js";

type TestView = View.ViewComponent;

function view(label: string): TestView {
	return { label } as unknown as TestView;
}

describe("core.frame.applicationSetup", () => {
	describe("foldViewModifications", () => {
		it("applies a modification to the matching registered view", () => {
			const base = view("base");
			const modified = view("modified");
			const modify = mock.fn((_: TestView) => modified);

			const result = foldViewModifications({ view1: base }, [{ name: "view1", modify }]);

			equal(result.view1, modified);
			equal(modify.mock.calls[0].arguments[0], base);
		});

		it("applies a modification to a built-in view when no registered view exists for that name", () => {
			// "GenericCaseMenu" is a real built-in registered in FrameFactories.viewProvider
			const modified = view("modified");
			const modify = mock.fn(() => modified);

			const result = foldViewModifications({}, [{ name: "GenericCaseMenu", modify }]);

			equal(result.GenericCaseMenu, modified);
			equal(modify.mock.callCount(), 1);
		});

		it("applies multiple modifications for the same name in registration order", () => {
			const base = view("base");
			const modifyA = mock.fn((v: TestView) =>
				view(`A(${(v as unknown as { label: string }).label})`)
			);
			const modifyB = mock.fn((v: TestView) =>
				view(`B(${(v as unknown as { label: string }).label})`)
			);

			const result = foldViewModifications({ view1: base }, [
				{ name: "view1", modify: modifyA },
				{ name: "view1", modify: modifyB }
			]);

			equal((result.view1 as unknown as { label: string }).label, "B(A(base))");
		});

		it("has no effect and does not throw when a modification matches no registered or built-in view", () => {
			const base = view("base");
			const modify = mock.fn(() => view("modified"));

			const result = foldViewModifications({ view1: base }, [{ name: "unknownView", modify }]);

			equal(result.view1, base);
			equal(result.unknownView, undefined);
			equal(modify.mock.callCount(), 0);
		});

		it("does not affect views not targeted by any modification", () => {
			const base1 = view("base1");
			const base2 = view("base2");

			const result = foldViewModifications({ view1: base1, view2: base2 }, [
				{ name: "view1", modify: () => view("modified") }
			]);

			equal(result.view2, base2);
		});
	});

	describe("foldLayoutModifications", () => {
		function layout(label: string): Layout {
			return { component: label } as unknown as Layout;
		}

		it("applies a modification to the matching registered layout", () => {
			const base = layout("base");
			const modified = layout("modified");
			const modify = mock.fn((_: Layout) => modified);

			const result = foldLayoutModifications({ layout1: base }, [{ name: "layout1", modify }]);

			equal(result.layout1, modified);
			equal(modify.mock.calls[0].arguments[0], base);
		});

		it("applies a modification to a built-in layout when no registered layout exists for that name", () => {
			// "ApplicationFrame" is a real built-in resolved by FrameFactories.layoutProvider
			const modified = layout("modified");
			const modify = mock.fn(() => modified);

			const result = foldLayoutModifications({}, [{ name: "ApplicationFrame", modify }]);

			equal(result.ApplicationFrame, modified);
		});

		it("has no effect when a modification matches neither a registered nor a built-in layout, instead of throwing", () => {
			// FrameFactories.layoutProvider throws for unknown names - this must be caught, not propagated
			const modify = mock.fn(() => layout("modified"));

			const result = foldLayoutModifications({}, [{ name: "unknownLayout", modify }]);

			equal(result.unknownLayout, undefined);
			equal(modify.mock.callCount(), 0);
		});
	});
});
