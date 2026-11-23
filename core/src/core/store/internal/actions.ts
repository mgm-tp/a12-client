// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { actionCreatorFactory } from "typescript-fsa";

const factory = actionCreatorFactory("Store");

export namespace StoreActions {
	/**
	 * Action to signal, that the application state should be reset
	 */
	export const resetState = factory("RESET_STORE");
}
