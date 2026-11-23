// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationModel } from "@com.mgmtp.a12.client/client-core";

import type { SampleAppModule } from "../../../utils/SampleAppModule.js";

import appmodel from "./errorHandling.appmodel.json" with { type: "json" };
import viewProvider from "./errorHandlingComponent.js";
import errorHandlingSagaEventsSaga from "./errorHandlingSaga.js";

const GeneralErrorHandlingModule: SampleAppModule = {
	id: "error_handling.general",
	model: () => appmodel as ApplicationModel,
	sagas: () => [errorHandlingSagaEventsSaga],
	views: () => viewProvider
};

export default GeneralErrorHandlingModule;
