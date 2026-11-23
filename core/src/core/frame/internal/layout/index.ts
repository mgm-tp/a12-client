// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import ApplicationFrameLayout from "./ApplicationFrameLayout.js";
import DashboardLayout from "./DashboardLayout.js";
import type { Layout } from "./LayoutProps.js";
import MasterDetailRegionLayout from "./MasterDetailRegionLayout.js";
import NullRegionLayout from "./NullRegionLayout.js";
import StackRegionLayout from "./StackRegionLayout.js";

/** @internal */
export default function DefaultLayoutProvider(name: string): Layout {
	switch (name) {
		case "ApplicationFrame":
			return ApplicationFrameLayout;
		case "Dashboard":
			return DashboardLayout;
		case "MasterDetail":
			return MasterDetailRegionLayout;
		case "Null":
			return NullRegionLayout;
		case "Stack":
			return StackRegionLayout;
		default:
			throw new Error("unknown layout " + name);
	}
}
