// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationSaga } from "./ApplicationSaga.js";
import CancelActivities from "./cancelActivities.js";
import { DataSagas } from "./data/index.js";
import ErrorHandling from "./errorHandling.js";
import MainMenuSagas from "./main-menu.js";

/** @internal */
export default function (config: ApplicationSaga.Configuration): ApplicationSaga.Descriptor[] {
	return [
		DataSagas.pushActivitySaga(),
		DataSagas.cancelActivitySaga(),
		DataSagas.commitDoneActivitySaga(),
		DataSagas.loadActivityDataSaga(config),
		DataSagas.reloadActivityDataSaga(),
		DataSagas.commitStartActivitySaga(config),
		DataSagas.saveActivitySaga(config),
		DataSagas.deleteDataSaga(config),
		CancelActivities.cancelActivities(),
		MainMenuSagas.mainMenuItemClickSaga(),
		ErrorHandling.logActivityErrorSaga(),
		ErrorHandling.saveActivityFailedSaga()
	];
}
