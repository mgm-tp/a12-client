// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { render, within, type RenderResult } from "@testing-library/react";
import type { ReactNode } from "react";

import { queries } from "./extended-queries.js";

export type ExtendedRenderResult = RenderResult<typeof queries, HTMLElement>;

function extendedRender(ui: ReactNode): ExtendedRenderResult {
	return render(ui, { queries });
}

function extendedWithin(element: HTMLElement) {
	return within(element, queries);
}

const extendedScreen = within(document.body, queries);

export { extendedRender as render, extendedScreen as screen, extendedWithin as within };
export type { ExtendedRenderResult as RenderResult };
