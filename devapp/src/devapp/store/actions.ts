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

import { actionCreatorFactory } from "typescript-fsa";

import type { ActivityActions } from "@com.mgmtp.a12.client/client-core";

const factory = actionCreatorFactory("DevApp");

/**
 * Application level actions
 */
export namespace DevAppActions {
	// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
	export const initialization = factory.async<void, void>("INITIALIZATION");

	/**
	 * Set of action to demonstrate the reset application feature
	 */
	export namespace ResetApplication {
		export const resetRequested = factory("RESET_APPLICATION_REQUESTED");
		export const resetApplication = factory("RESET_APPLICATION");
	}

	export const clearDeepLink = factory("CLEAR_DEEP_LINK");

	export const triggerStoreUpdate = factory("TRIGGER_STORE_UPDATE");

	export interface SetCasePayload extends ActivityActions.ActivityActionPayload {
		caze: string;
	}
	export const setCase = factory<SetCasePayload>("SET_CASE");

	export interface CounterData {
		count: number;
	}

	export function isCounterData(data: {} = {}): data is CounterData {
		return "count" in data && typeof data.count === "number";
	}
}
