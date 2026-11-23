// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Lens } from "../../lenses.js";

import { ApplicationSelectors, sliceSelector } from "./selectors.js";

const busyLens: Lens<object, boolean> = {
	get: ApplicationSelectors.busy(),
	set: busy => s =>
		busy !== busyLens.get(s) ? { ...s, application: { ...sliceSelector(s), busy } } : s
};

/**
 * Functions to access the application slice inside the Client state.
 */
export const ApplicationLenses = {
	/**
	 * Lens for the busy property
	 */
	busy: busyLens
};
