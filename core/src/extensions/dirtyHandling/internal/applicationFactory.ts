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
} from "../../../core/application/index.js";

import { DirtyHandlingFactories } from "./factories.js";
import { DirtyHandlingViews } from "./views.js";

// Do not change this target: the engines augment the package root too, and augmentations of different barrels merge depending on import order.
declare module "../../../core/index.js" {
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
 *
 * NOTE: If your app requires localizations, provide `withLocalization` before this.
 */
export const addDirtyHandlingWrapper = <T extends ApplicationWithDirtyHandlingConfig>(cfg: T) =>
	addWrapper(DirtyHandlingViews.VetoDialog)(cfg);

/**
 * @experimental
 */
export const addDirtyHandlingSagas = <T extends ApplicationWithDirtyHandlingConfig>(cfg: T) =>
	addPlatformSagas(...DirtyHandlingFactories.createSagas())(cfg);

/**
 * @experimental
 */
export const addDirtyConfirmationOnLeave = <T extends ApplicationWithDirtyHandlingConfig>(cfg: T) =>
	addInitialAction(store => {
		if (typeof window === "undefined") {
			return;
		}

		/*
		 * Listen to the window.onbeforeunload event to trigger a dialog
		 * if there are dirty activities when the application gets closed.
		 */
		window.onbeforeunload = () => {
			// Show the dialog if there are dirty activities.
			const dirtySubTree = ActivitySelectors.allDirtyActivities()(store.getState());
			if (dirtySubTree.length > 0) {
				return "Changes you made may not be saved.";
			} else {
				return undefined;
			}
		};
	})(cfg);

/**
 * @experimental
 *
 * Enables support for dirty handling. Adds a default veto dialog, which gets shown when
 * the users wants to leave the page (`onbeforeunload`) or if an activity gets cancelled.
 *
 * NOTE: If your app requires localizations, provide `withLocalization` before this.
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
