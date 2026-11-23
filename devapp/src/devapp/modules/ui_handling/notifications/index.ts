// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationModel } from "@com.mgmtp.a12.client/client-core";

import { SimpleFormFactories } from "../../../mocks/SimpleForm/index.js";
import type { SampleAppModule } from "../../../utils/SampleAppModule.js";

import { NotificationsSagas } from "./notification-middlewares.js";
import viewProvider from "./notification-views.js";
import appmodel from "./notifications.appmodel.json" with { type: "json" };

const NotificationsModule: SampleAppModule = {
	id: "ui_handling.notifications",
	model: () => appmodel as ApplicationModel,
	views: () => viewProvider,
	sagas: () => NotificationsSagas,
	dataLoaders: [
		new SimpleFormFactories.DataLoader({
			initialDocument: {
				scope: "global",
				severity: "info",
				display_time: "permanent",
				position: "top-left"
			},
			canHandle: ad => ad.model === "NotificationExample-document"
		})
	]
};

export default NotificationsModule;
