// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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

const dynamicFlows: (state: object) => DynamicFlow[] = state => {
	const [activity] = ActivitySelectors.activitiesByMatchCondition(matchesDynamicForm)(state);
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
								component: DynamicModelsSelect
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
								component: ModelHeaderEngine,
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
		const [activity] = ActivitySelectors.activitiesByDescriptor(DYNAMIC_MODELS_DESCRIPTOR)(state);
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

export default DynamicModelsModule;
