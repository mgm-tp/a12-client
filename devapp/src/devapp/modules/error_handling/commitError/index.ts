// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";

import type { SampleAppModule } from "../../../utils/SampleAppModule.js";

import appmodel from "./commitError.appmodel.json" with { type: "json" };
import CommitErrorHandling from "./commitError.js";
import { commitErrorDataLoader } from "./commitErrorDataLoader.js";
import CommitErrorHandlingFeature from "./commitErrorFeature.js";
import { commitErrorHandlingSaga } from "./commitErrorHandlingSaga.js";

const CommitErrorModule: SampleAppModule = {
	dataLoaders: [commitErrorDataLoader],
	id: "error_handling.commit-error",
	model: () => appmodel as ApplicationModel,
	sagas: () => [commitErrorHandlingSaga],
	views: () => viewProvider
};

const Views: { [name: string]: View.ViewComponent } = {
	CommitErrorHandling,
	CommitErrorHandlingFeature
};

function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

export default CommitErrorModule;
