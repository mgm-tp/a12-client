// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ServerConnector } from "@com.mgmtp.a12.utils/utils-connector/lib/main/index.js";
import { ConnectorLocator } from "@com.mgmtp.a12.utils/utils-connector/lib/main/index.js";

const serverConnector: ServerConnector = {
	fetchData(requestPayload) {
		return {};
	}
};

// tag::marker1[]
// Configure your server connector e.g. using UAA
ConnectorLocator.createInstance(serverConnector);
// end::marker1[]
