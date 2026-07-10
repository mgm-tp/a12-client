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

import type {
	Activity,
	DynamicConfiguration,
	DynamicFlow,
	DynamicMenu
} from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	ApplicationActions
} from "@com.mgmtp.a12.client/client-core";

import { withProgressIndicator } from "../../../utils/withProgressIndicator.js";

import { FastFoodForm } from "./fast-food-form.js";
import { FruitForm } from "./fruit-form.js";
import { HeterogeneityOverview } from "./heterogeneity-overview.js";
import { createNewDocumentSaga } from "./sagas.js";
import { VegetablesForm } from "./vegetables-form.js";

const INITIAL_DESCRIPTOR = {
	section: "DataHandling",
	feature: "heterogeneity",
	model: "Supertype_Food-document"
};

function matchesOverview(descriptor: Activity.Descriptor): boolean {
	return (
		descriptor.section === "DataHandling" &&
		descriptor.feature === "heterogeneity" &&
		!descriptor.instance
	);
}

function matchesFruits(descriptor: Activity.Descriptor): boolean {
	return descriptor.model === "SubType_Fruits-document" && !!descriptor.instance;
}

function matchesVegetables(descriptor: Activity.Descriptor): boolean {
	return descriptor.model === "SubType_Vegetables-document" && !!descriptor.instance;
}

function matchesFastFood(descriptor: Activity.Descriptor): boolean {
	return descriptor.model === "SubType_FastFood-document" && !!descriptor.instance;
}

const dynamicFlows: DynamicFlow[] = [
	{
		name: "data_handling.heterogeneity",
		scenes: [
			{
				name: "HeterogeneityOverview",
				matches: matchesOverview,
				sceneChange: {
					onEnter: [
						{ type: "DYNAMIC_CLEAR_REGION", region: "/CONTENT" },
						{
							type: "DYNAMIC_ADD_VIEW",
							component: withProgressIndicator(HeterogeneityOverview),
							region: "/CONTENT",
							models: [{ modelType: "document", name: "Supertype_Food-document" }]
						}
					]
				}
			},
			{
				name: "FruitsForm",
				priorScene: "HeterogeneityOverview",
				matches: matchesFruits,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: withProgressIndicator(FruitForm),
							region: "/CONTENT",
							models: [{ modelType: "document", name: "SubType_Fruits-document" }]
						}
					]
				}
			},
			{
				name: "VegetablesForm",
				priorScene: "HeterogeneityOverview",
				matches: matchesVegetables,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: withProgressIndicator(VegetablesForm),
							region: "/CONTENT",
							models: [{ modelType: "document", name: "SubType_Vegetables-document" }]
						}
					]
				}
			},
			{
				name: "FastFoodForm",
				priorScene: "HeterogeneityOverview",
				matches: matchesFastFood,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: withProgressIndicator(FastFoodForm),
							region: "/CONTENT",
							models: [{ modelType: "document", name: "SubType_FastFood-document" }]
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
				loadingState: "missing"
			}),
			descriptor: {}
		})
	);
}

function selectMenus(state: object): DynamicMenu[] {
	const activities = ActivitySelectors.activitiesByDescriptor(INITIAL_DESCRIPTOR)(state);
	return [
		{
			id: "data_handling.heterogeneity",
			label: {
				key: "data_handling.heterogeneity",
				defaults: { en: "Heterogeneity", de: "Heterogenität" }
			},
			action: onMenuClick,
			selected: activities.at(0) !== undefined
		}
	];
}

export const HeterogeneityDetailedModule: DynamicConfiguration = {
	id: "data_handling.heterogeneity.detailed",
	sagas: () => [createNewDocumentSaga],
	flows: dynamicFlows,
	menus: selectMenus
};
