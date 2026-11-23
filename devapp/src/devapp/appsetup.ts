// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
