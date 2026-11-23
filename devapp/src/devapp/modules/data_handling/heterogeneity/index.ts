// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Module, ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";

import { FastFoodForm } from "./fast-food-form.js";
import { FruitForm } from "./fruit-form.js";
import { HeterogeneityOverview } from "./heterogeneity-overview.js";
import appmodel from "./heterogeneity.appmodel.json" with { type: "json" };
import { createNewDocumentSaga } from "./sagas.js";
import { VegetablesForm } from "./vegetables-form.js";

const HeterogeneityDetailedModule: Module = {
	id: "data_handling.heterogeneity.detailed",
	model: () => appmodel as ApplicationModel,
	views: () => componentName => Views[componentName],
	sagas: () => [createNewDocumentSaga]
};

export default HeterogeneityDetailedModule;

const Views: { [name: string]: View.ViewComponent | undefined } = {
	HeterogeneityOverview,
	FruitForm,
	VegetablesForm,
	FastFoodForm
};
