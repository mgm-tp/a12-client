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

import type { Dispatch } from "redux";

import type { Activity, DynamicFlow, DynamicMenu } from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	ApplicationActions
} from "@com.mgmtp.a12.client/client-core";

import type { SampleAppModule } from "../../../utils/SampleAppModule.js";
import { withProgressIndicator } from "../../../utils/withProgressIndicator.js";

import { customDocumentDataLoader } from "./customDocumentDataLoader.js";
import { customOverviewDataLoader } from "./customOverviewDataLoader.js";
import { DataLoaderFeature } from "./dataLoaderFeature.js";
import { DocumentWithoutModel } from "./documentWithoutModel.js";
import { OverviewWithoutModel } from "./overviewWithoutModel.js";

const INITIAL_DESCRIPTOR = { section: "DataHandling", feature: "DataLoader" };

function matchesDataLoader(descriptor: Activity.Descriptor): boolean {
	return descriptor.section === "DataHandling" && descriptor.feature === "DataLoader";
}

function matchesOverview(descriptor: Activity.Descriptor): boolean {
	return descriptor.feature === "DataLoaderWithoutModel" && !descriptor.instance;
}

function matchesForm(descriptor: Activity.Descriptor): boolean {
	return descriptor.feature === "DataLoaderWithoutModel" && !!descriptor.instance;
}

const dynamicFlows: DynamicFlow[] = [
	{
		name: "data_handling.without-model",
		scenes: [
			{
				name: "DataLoader",
				matches: matchesDataLoader,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: withProgressIndicator(DataLoaderFeature),
							region: "/CONTENT"
						}
					]
				}
			},
			{
				name: "DATAOverview",
				matches: matchesOverview,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: withProgressIndicator(OverviewWithoutModel),
							region: "/CONTENT"
						}
					]
				}
			},
			{
				name: "DATAForm",
				matches: matchesForm,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: withProgressIndicator(DocumentWithoutModel),
							region: "/CONTENT"
						}
					]
				}
			}
		]
	}
];

function onMenuClick(dispatch: Dispatch): void {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: INITIAL_DESCRIPTOR,
				loadingState: "without"
			}),
			descriptor: {}
		})
	);
}

function selectMenus(state: object): DynamicMenu[] {
	const activities = ActivitySelectors.activitiesByDescriptor(INITIAL_DESCRIPTOR)(state);
	return [
		{
			id: "data_handling.without-model",
			label: {
				key: "data_handling.without-model",
				defaults: {
					en: "Data Loading without models",
					de: "Datenladen ohne Modelle"
				}
			},
			action: onMenuClick,
			selected: activities.at(0) !== undefined
		}
	];
}

export const DataWithoutModelModule: SampleAppModule = {
	id: "data_handling.without-model",
	dataLoaders: [customOverviewDataLoader, customDocumentDataLoader],
	flows: dynamicFlows,
	menus: selectMenus
};
