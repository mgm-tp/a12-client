// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";

import type { SampleAppModule } from "../../../utils/SampleAppModule.js";

import { DataEditorConsumer } from "./components/DataEditorConsumer.js";
import DataEditorFeature from "./components/DataEditorFeature.js";
import { DataEditorSource } from "./components/DataEditorSource.js";
import { DataEditorSourceOverview } from "./components/DataEditorSourceOverview.js";
import { bookDataEditor } from "./data/BookDataEditor.js";
import appModel from "./data_editor.appmodel.json" with { type: "json" };

const DataEditorModule: SampleAppModule = {
	id: "data_handling.data-editor",
	model: () => appModel as ApplicationModel,
	views: () => viewProvider,
	dataEditors: [bookDataEditor]
};

export default DataEditorModule;

function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

interface ViewMap {
	[name: string]: View.ViewComponent;
}

const Views: ViewMap = {
	DataEditorSourceOverview,
	DataEditorSource,
	DataEditorConsumer,
	DataEditorFeature
};
