// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import ApplicationFrameLayout from "../../../core/frame/internal/layout/ApplicationFrameLayout.js";
import type { Layout } from "../../../core/frame/internal/layout/LayoutProps.js";
import MasterDetailRegionLayout from "../../../core/frame/internal/layout/MasterDetailRegionLayout.js";
import NullRegionLayout from "../../../core/frame/internal/layout/NullRegionLayout.js";
import StackRegionLayout from "../../../core/frame/internal/layout/StackRegionLayout.js";

import mockLayout from "./MockLayout.js";

export default function LayoutProviderMock(name: string): Layout {
	switch (name) {
		case "ApplicationFrameMock":
			return ApplicationFrameLayout;
		case "NullMock":
			return NullRegionLayout;
		case "MasterDetailMock":
			return MasterDetailRegionLayout;
		case "StackMock":
			return StackRegionLayout;
		case "Mock":
			return mockLayout(() => <div />);
		default:
			throw new Error("unknown layout " + name);
	}
}
