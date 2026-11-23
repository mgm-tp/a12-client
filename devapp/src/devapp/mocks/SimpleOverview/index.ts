// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Module, View } from "@com.mgmtp.a12.client/client-core";

import { SimpleOverviewDataLoader } from "./data-loader.js";
import { OfferOverview } from "./overviews/offer-overview.js";
import { PersonOverview } from "./overviews/person-overview.js";
import { SimpleOverviewReducers } from "./reducers.js";
import { SimpleOverviewSagas } from "./sagas.js";

export { SimpleOverviewActions } from "./actions.js";
export { DocumentListData } from "./data.js";
export { SimpleOverview } from "./view.js";

export namespace SimpleOverviewFactories {
	export const DataLoader = SimpleOverviewDataLoader;

	export function createModule(): Module {
		return {
			id: "SimpleOverviewModule",
			sagas: () => SimpleOverviewSagas,
			dataReducers: () => SimpleOverviewReducers,
			views: () => componentName => Views[componentName]
		};
	}
}

const Views: { [name: string]: View.ViewComponent | undefined } = {
	PersonOverview,
	OfferOverview
};
