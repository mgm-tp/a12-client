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
	DynamicMatchCondition
} from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	ApplicationActions
} from "@com.mgmtp.a12.client/client-core";

import { ModelHeaderEngine } from "../../../mocks/engines.js";
import { withProgressIndicator } from "../../../utils/withProgressIndicator.js";

import { DynamicModelsSelect } from "./view.js";

const DYNAMIC_MODELS_DESCRIPTOR = { section: "Examples", feature: "DynamicModels" };

function isDynamicModelsDescriptor(descriptor: Activity.Descriptor): boolean {
	return (
		descriptor.section === DYNAMIC_MODELS_DESCRIPTOR.section &&
		descriptor.feature === DYNAMIC_MODELS_DESCRIPTOR.feature
	);
}

function onClick(dispatch: Dispatch) {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: DYNAMIC_MODELS_DESCRIPTOR,
				loadingState: "without"
			}),
			descriptor: {}
		})
	);
}

const matchesModelSelect: DynamicMatchCondition = descriptor => {
	return isDynamicModelsDescriptor(descriptor) && !descriptor.taskType;
};

const matchesDynamicForm: DynamicMatchCondition = descriptor => {
	return isDynamicModelsDescriptor(descriptor) && !!descriptor.taskType;
};

// must be created outside the flows selector: a component created per selector run
// gets a new identity on every state change, causing the view to remount each time
const DynamicModelsSelectWithProgress = withProgressIndicator(DynamicModelsSelect);
const ModelHeaderEngineWithProgress = withProgressIndicator(ModelHeaderEngine);

const dynamicFlows: (state: object) => DynamicFlow[] = state => {
	const activity = ActivitySelectors.activitiesByMatchCondition(matchesDynamicForm)(state).at(0);
	const taskType = activity?.descriptor.taskType;
	return [
		{
			name: "examples.dynamic-models",
			scenes: [
				{
					name: "Select",
					matches: matchesModelSelect,
					sceneChange: {
						onEnter: [
							{
								type: "DYNAMIC_ADD_VIEW",
								region: "/CONTENT",
								component: DynamicModelsSelectWithProgress
							}
						]
					}
				},
				{
					name: "Form",
					matches: matchesDynamicForm,
					sceneChange: {
						onEnter: [
							{
								type: "DYNAMIC_ADD_VIEW",
								region: "/CONTENT",
								component: ModelHeaderEngineWithProgress,
								models: [{ name: `${taskType}-document`, modelType: "document" }]
							}
						]
					}
				}
			]
		}
	];
};

export const DynamicModelsModule: DynamicConfiguration = {
	id: "examples.dynamic-models",
	menus: state => {
		const activity =
			ActivitySelectors.activitiesByDescriptor(DYNAMIC_MODELS_DESCRIPTOR)(state).at(0);
		const selected = activity !== undefined;
		return [
			{
				id: "examples.dynamic-models",
				label: { key: "examples.dynamic-models.menu" },
				action: onClick,
				selected
			}
		];
	},
	flows: dynamicFlows
};
