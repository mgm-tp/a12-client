// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { ActivitySelectors } from "../../../core/activity/internal/selectors.js";
import {
	addInitialAction,
	addPlatformSagas,
	addWrapper,
	combineFeatures,
	setConfigured
} from "../../../core/application/index.js";
import type {
	A12ApplicationConfig,
	ApplicationWithConfiguredFeature,
	RequireFeatures
} from "../../../core/application/internal/factories/applicationConfig.js";

import { DirtyHandlingFactories } from "./factories.js";
import { DirtyHandlingViews } from "./views.js";

declare module "../../../core/application/internal/factories/applicationConfig.js" {
	interface A12ApplicationConfig {
		dirtyHandling?: unknown;
	}
}

/**
 * @experimental
 */
export type ApplicationWithDirtyHandlingConfig = RequireFeatures<
	A12ApplicationConfig,
	{ dirtyHandling?: never }
>;

/**
 * @experimental
 */
export const addDirtyHandlingWrapper = <T extends ApplicationWithDirtyHandlingConfig>(cfg: T) =>
	addWrapper<T>(DirtyHandlingViews.VetoDialog)(cfg);

/**
 * @experimental
 */
export const addDirtyHandlingSagas = <T extends ApplicationWithDirtyHandlingConfig>(cfg: T) =>
	addPlatformSagas<T>(...DirtyHandlingFactories.createSagas())(cfg);

/**
 * @experimental
 */
export const addDirtyConfirmationOnLeave = <T extends ApplicationWithDirtyHandlingConfig>(cfg: T) =>
	addInitialAction<T>(store => {
		/*
		 * Listen to the window.onbeforeunload event to trigger a dialog
		 * if there are dirty or locked activities when the application gets closed.
		 */
		window.onbeforeunload = () => {
			// Show the dialog if there are dirty or locked activities.
			const dirtySubTree = ActivitySelectors.allDirtyOrLockedActivities()(store.getState());
			if (dirtySubTree.length > 0) {
				return "Changes you made may not be saved.";
			} else {
				return undefined;
			}
		};
	})(cfg);

/**
 * @experimental
 */
export const withDirtyHandling = <T extends ApplicationWithDirtyHandlingConfig>(
	cfg: T
): ApplicationWithConfiguredFeature<T, "dirtyHandling"> =>
	setConfigured<T, "dirtyHandling">("dirtyHandling")(
		combineFeatures(
			addDirtyHandlingWrapper,
			addDirtyHandlingSagas,
			addDirtyConfirmationOnLeave
		)(cfg)
	);
