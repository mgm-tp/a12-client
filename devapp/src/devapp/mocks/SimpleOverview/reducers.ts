// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ActivityReducers } from "@com.mgmtp.a12.client/client-core";

import { SimpleOverviewActions } from "./actions.js";
import { DocumentListData } from "./data.js";

export type SimpleFormSlice = {
	readonly fullTextSearch?: string;
};

const queryParametersChangedReducer: ActivityReducers.DataReducer = {
	reduce(dataHolders, action) {
		if (!SimpleOverviewActions.onQueryParametersChanged.match(action)) {
			return dataHolders;
		}

		return dataHolders.map(dh => {
			return DocumentListData.isInstance(dh.data)
				? {
						...dh,
						slices: {
							...dh.slices,
							fullTextSearch: action.payload.fullTextSearch
						} satisfies SimpleFormSlice
					}
				: dh;
		});
	}
};

export const SimpleOverviewReducers = [queryParametersChangedReducer];
