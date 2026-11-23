// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationModel } from "@com.mgmtp.a12.client/client-core";

import type { SampleAppModule } from "../../../utils/SampleAppModule.js";

import { articleDataLoader } from "./articleDataLoader.js";
import appmodel from "./dashboard-layout.appmodel.json" with { type: "json" };
import { createMultipleActivitiesForDashboard } from "./dashboardSaga.js";
import viewProvider from "./dashboardViews.js";

const DashboardLayoutModule: SampleAppModule = {
	dataLoaders: [articleDataLoader],
	id: "ui_handling.dashboard-layout",
	model: () => appmodel as ApplicationModel,
	sagas: () => [createMultipleActivitiesForDashboard],
	views: () => viewProvider
};

export default DashboardLayoutModule;
