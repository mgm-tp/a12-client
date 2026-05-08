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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import { ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { DeepLinkingFactories } from "@com.mgmtp.a12.client/client-core/deepLinking";
import { Settings } from "@com.mgmtp.a12.utils/utils-logging/lib/Settings.js";

import { model } from "./appmodel.js";
import { registerModeSwitchEventHandlers } from "./config/development.js";
import { DynamicConsoleLoggingStrategy } from "./config/loggingStrategy.js";
import type { CustomSetupConfig } from "./createAppSetup.js";
import { createAppSetupWithStateHistory } from "./createAppSetup.js";
import { SimpleFormFactories } from "./mocks/SimpleForm/index.js";
import { SimpleOverviewFactories } from "./mocks/SimpleOverview/index.js";
import type { CustomSetup } from "./steps/factories.js";
import { DevAppActions } from "./store/actions.js";

export function createAppSetupForRender(
	configOptions: Pick<CustomSetupConfig, "modelLoader" | "reducerMap">
): CustomSetup {
	Settings.LogStrategy = new DynamicConsoleLoggingStrategy();

	const config = createAppSetupWithStateHistory({
		...configOptions,
		model: model,
		dataHandlers: [new SimpleOverviewFactories.DataLoader(), new SimpleFormFactories.DataLoader()],
		customSagas: DeepLinkingFactories.createSagas({
			applyTriggers: [DevAppActions.initialization.done],
			clearTriggers: [DevAppActions.ResetApplication.resetApplication]
		})
	});

	registerModeSwitchEventHandlers();

	/*
	 * Listen to the window.onbeforeunload event to trigger a dialog
	 * if there are dirty or locked activities when the application gets closed.
	 */
	window.onbeforeunload = event => {
		// Show the dialog if there are dirty or locked activities.
		const dirtySubTree = ActivitySelectors.allDirtyOrLockedActivities()(config.store.getState());
		if (dirtySubTree.length > 0) {
			event.preventDefault();
		}
	};

	return config;
}
