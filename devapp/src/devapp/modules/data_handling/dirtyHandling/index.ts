// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationModel } from "@com.mgmtp.a12.client/client-core";

import type { SampleAppModule } from "../../../utils/SampleAppModule.js";

import appmodel from "./dirtyHandling.appmodel.json" with { type: "json" };
import viewProvider from "./dirtyHandling.js";
import { dirtyHandlingFeatureSaga } from "./dirtyHandlingFeatureSaga.js";
import { dataReducers } from "./reducers.js";
import { initializeDataHolders, startDirtyHandlingExampleSaga } from "./sagas.js";

const DirtyHandlingModule: SampleAppModule = {
	id: "data_handling.dirty-handling",
	model: () => appmodel as ApplicationModel,
	dataReducers: () => dataReducers,
	sagas: () => [dirtyHandlingFeatureSaga, initializeDataHolders, startDirtyHandlingExampleSaga],
	views: () => viewProvider
};

export default DirtyHandlingModule;
