// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";

import type { SampleAppModule } from "../../../utils/SampleAppModule.js";
import { SimpleSagaStatus } from "../../examples/simpleSaga/simpleSagaView.js";

import SampleSidebarContent from "./sidebar.js";
import appmodel from "./viewsConcept.appmodel.json" with { type: "json" };
import { ViewsConceptEmpty } from "./viewsConceptEmptyTemplate.js";
import ViewsConcept from "./viewsConceptTemplate.js";

const ViewsConceptModule: SampleAppModule = {
	id: "ui_handling.views-concept",
	model: () => appmodel as ApplicationModel,
	views: () => viewProvider
};

export default ViewsConceptModule;

function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName] || AppFrameViews[componentName];
}

const Views: { [name: string]: View.ViewComponent } = {
	ViewsConcept,
	ViewsConceptEmpty,
	SampleSidebarContent
};

const AppFrameViews: { [name: string]: View.ViewComponent } = {
	SimpleSagaStatus: SimpleSagaStatus
};
