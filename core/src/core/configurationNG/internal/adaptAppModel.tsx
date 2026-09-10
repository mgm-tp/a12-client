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
 * 1. Open-Source License - EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED "AS IS" AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
