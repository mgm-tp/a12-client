// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationSetup, ApplicationModel } from "@com.mgmtp.a12.client/client-core";
import { ApplicationFactories, ModelActions } from "@com.mgmtp.a12.client/client-core";
import { createPlatformServerModelLoader } from "@com.mgmtp.a12.client/client-core/modelLoader";
import type { RestServerConnector } from "@com.mgmtp.a12.utils/utils-connector/lib/main/index.js";
import { ConnectorLocator } from "@com.mgmtp.a12.utils/utils-connector/lib/main/index.js";
import { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/Relationship/ModelGraph.js";

import model from "../models/documentation-mock.appmodel.json" with { type: "json" };

// tag::graph[]
// create your appsetup
const config = ApplicationFactories.createApplicationSetup({
	model: model as ApplicationModel,
	modelLoader: createPlatformServerModelLoader(),
	dataHandlers: []
});

// ...later (e.g. after a user logged in)
configureModelGraph(config);

async function configureModelGraph(config: ApplicationSetup) {
	// assuming a configured server connector
	const serverConnector =
		ConnectorLocator.getInstance().getServerConnector() as RestServerConnector;

	// fetch the graph in some way
	const modelGraph = await serverConnector.fetchData(ModelGraph.build(true)).then(r => r.json());

	// set it into state
	config.store.dispatch(ModelActions.setModelGraph(modelGraph));
}
// end::graph[]
