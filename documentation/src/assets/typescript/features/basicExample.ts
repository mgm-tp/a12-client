// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

// tag::localeLens[]
import type { Reducer } from "redux";
import { actionCreatorFactory } from "typescript-fsa";

import { LocaleLenses } from "@com.mgmtp.a12.client/client-core";
import { Locale } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/Locale.js";

// a custom action to set the locale from a string
export const customLocaleAction = actionCreatorFactory()<{
	readonly localeString: string;
}>("CUSTOM_SET_LOCALE");

export const rootReducerWithLocaleLens: (defaultReducer: Reducer<object>) => Reducer<object> =
	defaultReducer => (state, action) => {
		return customLocaleAction.match(action) && state
			? // using the locale lens to perform the state update
				LocaleLenses.locale.set(Locale.fromString(action.payload.localeString) as Locale)(state)
			: defaultReducer(state, action);
	};
// end::localeLens[]
