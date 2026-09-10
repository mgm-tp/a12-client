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

import type { AnyAction } from "typescript-fsa";
import { actionCreatorFactory } from "typescript-fsa";

import type { ApplicationModel } from "../../model/internal/ApplicationModel.js";

const factory = actionCreatorFactory("Application");

/**
 * Application level actions
 */
export namespace ApplicationActions {
	export interface StartMainActivityRequestedPayload extends ApplicationModel.InitialActivity {
		/**
		 * @experimental
		 *
		 * Only useful when used with `DynamicConfiguration` modules.
		 *
		 * When only `descriptor` is given, the `loadingState` of the new activity will be determined from the currently matching scene.
		 * If the scene is dynamically created, it might not exist yet. For these cases, the push action (and therefore its `loadingState`)
		 * can be set directly.
		 */
		readonly action?: AnyAction;
	}

	/**
	 * An action to signal, that the start of a main activity is requested.
	 * This can e.g. be useful, when the user clicks on another main menu entry and the main activity of the current
	 * menu entry needs to be informed.
	 */
	export const startMainActivityRequested = factory<StartMainActivityRequestedPayload>(
		"START_MAIN_ACTIVITY_REQUESTED"
	);

	/**
	 * Action to set application into a busy state, which could e.g. be used to decide, whether to show a global progress
	 * indicator
	 */
	export const setBusy = factory<boolean>("SET_BUSY");

	export const addModuleIds = factory<string[]>("ADD_MODULE_IDS");
	export const removeModuleIds = factory<string[]>("REMOVE_MODULE_IDS");
}
