// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationModel } from "@com.mgmtp.a12.client/client-core";
import { ModuleTestExtensions, ModelActions } from "@com.mgmtp.a12.client/client-core";

import { createAppSetupWithStateHistory } from "../devapp/createAppSetup.js";
import { MOCK_MODEL_GRAPH } from "../devapp/mocks/modelGraph/ModelGraph.js";
import { SimpleFormFactories } from "../devapp/mocks/SimpleForm/index.js";
import { SimpleOverviewFactories } from "../devapp/mocks/SimpleOverview/index.js";
import type { CustomSetup } from "../devapp/steps/factories.js";

import { newFileSystemModelLoader } from "./mocks/ModelLoader.js";

export function createAppSetup(model: ApplicationModel): CustomSetup {
	ModuleTestExtensions.reset();

	const config = createAppSetupWithStateHistory({
		modelLoader: newFileSystemModelLoader,
		dataHandlers: [new SimpleOverviewFactories.DataLoader(), new SimpleFormFactories.DataLoader()],
		model
	});
	config.store.dispatch(ModelActions.setModelGraph(MOCK_MODEL_GRAPH));

	return config;
}
