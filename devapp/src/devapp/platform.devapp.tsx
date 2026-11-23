// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import "./whyDidYouRender/index.js";
import { createPlatformServerModelLoader } from "@com.mgmtp.a12.client/client-core/modelLoader";
import { DataServicesReducerMap } from "@com.mgmtp.a12.dataservices/dataservices-access";

import { createAppSetupForRender } from "./appsetup.js";
import { setupServerConnection } from "./server-connection/setupServerConnection.js";

import { devAppMain } from "./index.js";

const config = createAppSetupForRender({
	modelLoader: createPlatformServerModelLoader(),
	reducerMap: DataServicesReducerMap
});

devAppMain(config, setupServerConnection);
