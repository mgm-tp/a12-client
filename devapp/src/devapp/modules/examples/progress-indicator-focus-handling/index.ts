// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationModel } from "@com.mgmtp.a12.client/client-core";

import type { SampleAppModule } from "../../../utils/SampleAppModule.js";

import { FocusHandlingProgressIndicatorDataProvider } from "./dataProvider.js";
import appmodel from "./focusHandlingProgressIndicator.appmodel.json" with { type: "json" };
import { pushFocusHandlingActivity } from "./sagas.js";
import { viewProvider } from "./viewProvider.js";

const FocusHandlingProgressIndicatorModule: SampleAppModule = {
	id: "examples.focus_handling_progress_indicator",
	model: () => appmodel as ApplicationModel,
	sagas: () => [pushFocusHandlingActivity],
	views: () => viewProvider,
	dataProviders: () => [FocusHandlingProgressIndicatorDataProvider]
};

export default FocusHandlingProgressIndicatorModule;
