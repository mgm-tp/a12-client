// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { memoize } from "../../3rd-party-licenses/memoize.js";
import type { ActivityMap } from "../../activity/internal/activityMap.js";
import { ActivitySelectors } from "../../activity/internal/selectors.js";
import type { ApplicationModel } from "../../model/internal/ApplicationModel.js";
import { ModelSelectors } from "../../model/internal/selectors.js";
import { shallowEqualizeWithoutArgs } from "../../store/internal/selectors.js";

import {
	convertToDynamicFlow,
	convertToDynamicRegion,
	createDynamicMenuConverter
} from "./convertToDynamic.js";
import type { DynamicConfiguration } from "./dynamicConfiguration.js";

const memoizedFlows = memoize((appModel: ApplicationModel) =>
	appModel.content.modules.flatMap(m => m.flows.map(f => convertToDynamicFlow(f, appModel, m.name)))
);

const memoizedRegions = memoize((appModel: ApplicationModel) => [
	convertToDynamicRegion(appModel.content.region, [], true)
]);

const memoizedMenus = memoize((appModel: ApplicationModel) =>
	memoize((topLevelActivities: ActivityMap) =>
		appModel.content.modules.flatMap(m =>
			m.menu ? createDynamicMenuConverter(appModel, m, topLevelActivities)(m.menu) : []
		)
	)
);

const selectTopLevelActivities = shallowEqualizeWithoutArgs(ActivitySelectors.topLevelActivities);

/**
 * @experimental
 */
export const AppmodelToDynamicConfigurationAdapter: DynamicConfiguration = {
	id: `AppmodelToDynamicConfigurationAdapter`,
	flows: state => {
		const appModel = ModelSelectors.applicationModel()(state);

		return memoizedFlows(appModel);
	},
	regions: state => {
		const appModel = ModelSelectors.applicationModel()(state);

		return memoizedRegions(appModel);
	},
	menus: state => {
		const topLevelActivities = selectTopLevelActivities()(state);
		const appModel = ModelSelectors.applicationModel()(state);

		return memoizedMenus(appModel)(topLevelActivities);
	}
};
