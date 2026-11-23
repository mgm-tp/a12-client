// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";

import type { SampleAppModule } from "../../../utils/SampleAppModule.js";

import appmodel from "./simpleSaga.appmodel.json" with { type: "json" };
import { simpleSagaEventsSaga } from "./simpleSaga.js";
import { SimpleSaga, SimpleSagaStatus } from "./simpleSagaView.js";

const BackgroundSagaModule: SampleAppModule = {
	id: "examples.background-saga",
	model: () => appmodel as ApplicationModel,
	sagas: () => [simpleSagaEventsSaga],
	views: () => viewProvider
};

export default BackgroundSagaModule;

function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

const Views: { [name: string]: View.ViewComponent } = {
	SimpleSaga: SimpleSaga,
	SimpleSagaStatus: SimpleSagaStatus
};
