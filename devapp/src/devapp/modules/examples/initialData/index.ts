// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Module, ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";

import appmodel from "./initialData.appmodel.json" with { type: "json" };
import { InitialDataFeature } from "./InitialDataFeature.js";
import { InitialDataForm } from "./InitialDataForm.js";

const InitialDataModule: Module = {
	id: "examples.initial-data",
	model: () => appmodel as ApplicationModel,
	views: () => viewProvider
};

export default InitialDataModule;

function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

const Views: { [name: string]: View.ViewComponent } = {
	InitialDataFeature,
	InitialDataForm
};
