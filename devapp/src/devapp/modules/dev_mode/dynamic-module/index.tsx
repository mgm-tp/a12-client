// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Module, ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";

import appmodel from "./dynamic-module.appmodel.json" with { type: "json" };
import { DynamicModuleExampleView } from "./dynamic_module_example.js";

const DynamicModule: Module = {
	id: "dev-mode.dynamic-module",
	model: () => appmodel as ApplicationModel,
	views: () => name => Views[name]
};

export default DynamicModule;

const Views: { [name: string]: View.ViewComponent } = {
	"DevMode.DynamicModuleExample": DynamicModuleExampleView
};
