/*
 * SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
 *
 * Copyright (c) 2012-2026 mgm technology partners GmbH
 *
 * Dual License
 * ------------
 * This source file is part of the mgm A12 Platform and available under
 * a choice of two different licenses:
 *
 * 1. Open-Source License - EUPL v1.2
 *    You may redistribute and/or modify this file under the terms of the
 *    European Union Public License, version 1.2 - see https://eupl.eu/.
 *
 * 2. Commercial License
 *    Alternatively, you may obtain a commercial license from
 *    mgm technology partners GmbH, that permits use of this software
 *    under different terms (including support and maintenance services).
 *
 *    Please contact a12-license@mgm-tp.com for more information.
 *
 * You must select and comply with exactly one of the above license options.
 *
 * Warranty Disclaimer (applies to either option)
 * ----------------------------------------------
 * THIS SOFTWARE IS PROVIDED "AS IS" AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
