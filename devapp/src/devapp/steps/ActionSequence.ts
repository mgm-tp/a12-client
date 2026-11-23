// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Action } from "./Action.js";

/**
 * Represents an object, which can be used to define a sequence of actions
 */
export interface ActionSequence<T extends Action.Base = never> {
	/** Name of the sequence */
	readonly name: string;

	/** Array of actions */
	readonly steps: ReadonlyArray<Action<T>>;

	/** Function that runs after execution of all steps has finished */
	cleanup?(): void;
}
