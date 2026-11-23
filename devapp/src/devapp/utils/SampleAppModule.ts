// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationSaga, Module, DataLoader } from "@com.mgmtp.a12.client/client-core";

export interface SampleAppModule extends Module {
	readonly dataLoaders?: DataLoader[];
	readonly applicationSagas?: ((
		config: ApplicationSaga.Configuration
	) => ApplicationSaga.Descriptor)[];
}
