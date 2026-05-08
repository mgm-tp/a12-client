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

import type { Action } from "redux";

import type { ApplicationSetup } from "@com.mgmtp.a12.client/client-core";

/**
 * A data structure to preserve the history of the application state.
 */
export interface StateHistory {
	/** states that the application went through */
	entries: StateHistory.Entry[];
	/** the last entry in the state history, can be undefined if the application just started */
	lastEntry(): StateHistory.Entry | undefined;
	/** returns all state history entries after the given entry */
	entriesAfter(startEntry: StateHistory.Entry): StateHistory.Entry[];
	/** removes all entries from the state history */
	clear(): void;
}
export namespace StateHistory {
	/**
	 * An entry in the state history, containing the action, that triggered the state change,
	 * the state before and after the action dispatch and the timestamp of the state change.
	 */
	export interface Entry {
		readonly action: Action;
		readonly stateBefore: object;
		readonly stateAfter: object;
		readonly date: Date;
	}
}

export namespace StateHistoryFactory {
	/**
	 * A factory function to create a StateHistory object from a given array of StateHistory entries.
	 * If no entries are given, an empty history is created.
	 */
	export function createStateHistory(entries: StateHistory.Entry[] = []): StateHistory {
		return {
			entries,
			lastEntry: () => (entries.length > 0 ? entries[entries.length - 1] : undefined),
			entriesAfter: entry => {
				const index = entries.lastIndexOf(entry);
				return index >= 0 ? entries.slice(entries.lastIndexOf(entry) + 1) : [];
			},
			clear: () => (entries.length = 0)
		};
	}
}

export interface CustomSetup extends ApplicationSetup {
	readonly stateHistory: StateHistory;
}
