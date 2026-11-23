// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

// tag::setup[]
import {
	AppModelAdapterModule,
	ApplicationFactories,
	ModuleRegistryProvider,
	APPLICATION_MODEL_PLACEHOLDER
} from "@com.mgmtp.a12.client/client-core";
import { createPlatformServerModelLoader } from "@com.mgmtp.a12.client/client-core/modelLoader";

// register the adapter module like other Client modules
ModuleRegistryProvider.getInstance().addModule(AppModelAdapterModule);

ApplicationFactories.createApplicationSetup({
	// this placeholder is just a completely empty application model
	model: APPLICATION_MODEL_PLACEHOLDER,
	modelLoader: createPlatformServerModelLoader(),
	dataHandlers: [],
	additionalMiddlewares: []
});

// NOTE: do not forget to setup up your modelGraph

// end::setup[]
