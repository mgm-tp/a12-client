// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import "./whyDidYouRender/index.js";
import { ModelActions } from "@com.mgmtp.a12.client/client-core";
import { createHttpModelLoader } from "@com.mgmtp.a12.client/client-core/modelLoader";

import { createAppSetupForRender } from "./appsetup.js";
import { MOCK_MODEL_GRAPH } from "./mocks/modelGraph/ModelGraph.js";
import { setupSteps } from "./steps/setupSteps.js";

import { devAppMain } from "./index.js";

const config = createAppSetupForRender({
	modelLoader: createHttpModelLoader()
});

setupSteps(config.store, config.stateHistory);

devAppMain(config, async function setupApplication(): Promise<void> {
	config.store.dispatch(ModelActions.setModelGraph(MOCK_MODEL_GRAPH));
});
