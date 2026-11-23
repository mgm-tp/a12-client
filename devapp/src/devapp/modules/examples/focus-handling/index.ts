// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationModel } from "@com.mgmtp.a12.client/client-core";

import type { SampleAppModule } from "../../../utils/SampleAppModule.js";

import appmodel from "./focushandling.appmodel.json" with { type: "json" };
import { createFocusSaga } from "./focusHandlingSaga.js";
import { viewProvider } from "./viewProvider.js";

const FocusHandlingModule: SampleAppModule = {
	id: "examples.focus_handling",
	model: () => appmodel as ApplicationModel,
	sagas: () => [createFocusSaga()],
	views: () => viewProvider
};

export default FocusHandlingModule;
