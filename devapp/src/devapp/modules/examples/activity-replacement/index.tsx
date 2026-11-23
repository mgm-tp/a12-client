// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Module, ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";

import appmodel from "./activity-replacement.appmodel.json" with { type: "json" };
import { ActivityReplacementForm } from "./ActivityReplacementForm.js";
import { ActivityReplacementOverview } from "./ActivityReplacementOverview.js";
import { eventTriggerSaga } from "./sagas.js";

const InitialDataModule: Module = {
	id: "examples.activity-replacement",
	model: () => appmodel as ApplicationModel,
	sagas: () => [eventTriggerSaga],
	views: () => viewProvider
};

function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

const Views: { [name: string]: View.ViewComponent } = {
	ActivityReplacementOverview,
	ActivityReplacementForm
};

export default InitialDataModule;
