// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { actionCreatorFactory } from "typescript-fsa";

import type { ActivityActions } from "@com.mgmtp.a12.client/client-core";

const factory = actionCreatorFactory("DevApp");

/**
 * Application level actions
 */
export namespace DevAppActions {
	// oxlint-disable-next-line typescript/no-invalid-void-type
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
