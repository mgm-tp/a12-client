// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";

import type { SampleAppModule } from "../../../utils/SampleAppModule.js";

import { customDocumentDataLoader } from "./customDocumentDataLoader.js";
import { customOverviewDataLoader } from "./customOverviewDataLoader.js";
import { DataLoaderFeature } from "./dataLoaderFeature.js";
import appmodel from "./dataWithoutModel.appmodel.json" with { type: "json" };
import { DocumentWithoutModel } from "./documentWithoutModel.js";
import { OverviewWithoutModel } from "./overviewWithoutModel.js";

const DataWithoutModelModule: SampleAppModule = {
	dataLoaders: [customOverviewDataLoader, customDocumentDataLoader],
	id: "data_handling.without-model",
	model: () => appmodel as ApplicationModel,
	views: () => viewProvider
};

export default DataWithoutModelModule;

function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

const Views: { [name: string]: View.ViewComponent | undefined } = {
	OverviewWithoutModel,
	DocumentWithoutModel,
	DataLoaderFeature
};
