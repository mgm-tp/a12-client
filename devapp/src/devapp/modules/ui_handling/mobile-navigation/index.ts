// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationModel } from "@com.mgmtp.a12.client/client-core";

import type { SampleAppModule } from "../../../utils/SampleAppModule.js";

import { createMultipleActivitiesForDashboard } from "./dashboardSaga.js";
import appmodel from "./mobile-navigation.appmodel.json" with { type: "json" };
import viewProvider from "./views.js";

const MobileNavigationModule: SampleAppModule = {
	id: "ui_handling.mobile-navigation",
	model: () => appmodel as ApplicationModel,
	sagas: () => [createMultipleActivitiesForDashboard],
	views: () => viewProvider
	// dataLoaders: [
	// 	new SimpleFormDataLoader<NotificationDocument>(undefined, ad => {
	// 		return !!ad.instance?.startsWith("Person-document");
	// 	})
	// ]
};

export default MobileNavigationModule;
