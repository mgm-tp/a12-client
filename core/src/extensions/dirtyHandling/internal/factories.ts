// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationSaga } from "../../../core/application/index.js";

import { dirtyHandlingSaga } from "./dirtyHandling.js";

export namespace DirtyHandlingFactories {
	/**
	 * Necessary sagas for dirty handling to work.
	 */
	export function createSagas(): ApplicationSaga.Descriptor[] {
		return [dirtyHandlingSaga()];
	}
}
