// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type {
	ApplicationSetup,
	DataHandler,
	ApplicationModel,
	ModelLoader
} from "@com.mgmtp.a12.client/client-core";
import { ApplicationFactories, ModuleRegistryProvider } from "@com.mgmtp.a12.client/client-core";

import { myModule } from "./myModule.js";

export const moduleAppModel: ApplicationModel = {
	header: {
		id: "dummy",
		modelType: "application",
		modelVersion: "4.0.0"
	},
	content: {
		region: {
			name: "dummy",
			layout: {
				name: "dummyLayout"
			}
		},
		defaultRegion: ["dummy"],
		modules: []
	}
};

const emptyDataHub: DataHandler[] = [];
const emptyModelLoader: ModelLoader = {
	name: "emptyModelLoader",
	load: () => Promise.resolve({})
};

// tag::registration[]
// Load the moduleAppModel before
ModuleRegistryProvider.getInstance().addModule(myModule);

const model: ApplicationModel = {
	header: {
		id: "base-application-model",
		locales: [{ code: "en" }],
		modelType: "application",
		modelVersion: "4.0.0"
	},
	content: {
		region: {
			name: "APP",
			layout: { name: "ApplicationFrame" },
			subRegions: [{ name: "CONTENT", layout: { name: "MasterDetail" } }]
		},
		defaultRegion: ["CONTENT"],
		modules: [/* Add your flows and scenes here */]
	}
};

export const config: ApplicationSetup = ApplicationFactories.createApplicationSetup({
	model,
	modelLoader: emptyModelLoader,
	dataHandlers: emptyDataHub,
	additionalMiddlewares: []
});
// end::registration[]
