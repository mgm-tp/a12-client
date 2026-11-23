// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

// tag::root[]
import type { Reducer } from "redux";

import { ApplicationFactories } from "@com.mgmtp.a12.client/client-core";

declare const otherConfig: ApplicationFactories.Config;

const customRootReducer: (defaultReducer: Reducer<object>) => Reducer<object> =
	defaultReducer => (state, action) => {
		switch (action.type) {
			case "CUSTOM_ACTION": {
				// handle custom action here
				return { ...state, custom: true };
			}

			// fall back to the default root reducer to make sure
			// the default Client actions are handled properly
			default:
				return defaultReducer(state, action);
		}
	};

ApplicationFactories.createApplicationSetup({ ...otherConfig, rootReducer: customRootReducer });
// end::root[]
