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

import type { Dispatch } from "redux";

import type {
	DynamicConfiguration,
	DynamicFlow,
	DynamicMenu,
	DynamicRegion
} from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	ApplicationActions,
	NullRegionLayoutNG
} from "@com.mgmtp.a12.client/client-core";

import { DataHolderView } from "./DataHolderView.js";
import { ExampleProvider } from "./DataProvider.js";
import {
	FRAME_DESCRIPTOR,
	isExampleDescriptor,
	isFrameDescriptor,
	selectExampleActivity
} from "./descriptor.js";
import { EXAMPLE_REGION, FrameView } from "./FrameView.js";
import { loggerSaga } from "./loggerSaga.js";
import { dataReducers } from "./reducers.js";
import { setLoadingStateMiddleware } from "./setLoadingStateMiddleware.js";
import { StateChangeView } from "./StateChangeView.js";

function selectMenus(state: object): DynamicMenu[] {
	return [
		{
			id: "data_handling.saga-state-changes",
			label: { key: "examples.data-handling.saga-state-changes.menu" },
			selected: ActivitySelectors.activitiesByDescriptor(FRAME_DESCRIPTOR)(state).length > 0,
			action: onClick
		}
	];
}

function onClick(dispatch: Dispatch) {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: FRAME_DESCRIPTOR,
				loadingState: "without"
			}),
			descriptor: {}
		})
	);
}

const dynamicFlows: DynamicFlow[] = [
	{
		name: "data_handling.saga-state-changes",
		scenes: [
			{
				name: "FrameScene",
				matches: isFrameDescriptor,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							region: "/CONTENT",
							component: FrameView
						},
						{
							type: "DYNAMIC_ADD_VIEW",
							region: "/SIDEBAR",
							component: StateChangeView
						}
					]
				}
			},
			{
				name: "ExampleScene",
				matches: isExampleDescriptor,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							region: EXAMPLE_REGION,
							component: DataHolderView
						}
					]
				}
			}
		]
	}
];

function selectRegions(state: object): DynamicRegion[] {
	return selectExampleActivity(state)
		? [
				{
					name: EXAMPLE_REGION,
					layout: NullRegionLayoutNG
				}
			]
		: [];
}

export const DataSagaHandlingModule: DynamicConfiguration = {
	id: "data_handling.saga-state-changes",
	dataReducers: () => dataReducers,
	dataProviders: () => [ExampleProvider],
	sagas: () => [loggerSaga],
	middlewares: () => [setLoadingStateMiddleware],
	menus: selectMenus,
	flows: dynamicFlows,
	regions: selectRegions
};
