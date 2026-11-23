// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Module, ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";

import appmodel from "./modelDrivenDialog.appmodel.json" with { type: "json" };
import { ModelDrivenDialogForm } from "./ModelDrivenDialogForm.js";
import ModelDrivenDialogOverview from "./ModelDrivenDialogOverview.js";

const ModelDrivenDialogModule: Module = {
	id: "examples.model-driven-dialog",
	model: () => appmodel as ApplicationModel,
	views: () => viewProvider
};

function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

const Views: { [name: string]: View.ViewComponent } = {
	ModelDrivenDialogOverview,
	ModelDrivenDialogForm
};

export default ModelDrivenDialogModule;
