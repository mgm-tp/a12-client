// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Dispatch } from "redux";

import type { DynamicConfiguration, DynamicFlow } from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	ApplicationActions
} from "@com.mgmtp.a12.client/client-core";

import { SaveTodosProvider, TodosProviderListA, TodosProviderListB } from "./data-providers.js";
import { EXAMPLE_DESCRIPTOR, isExampleDescriptor } from "./descriptor.js";
import { MultipleDataHoldersView } from "./MultipleDataHoldersView.js";
import { dataReducers } from "./reducers.js";
import { initializeDataHolders } from "./sagas.js";

function onClick(dispatch: Dispatch) {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: EXAMPLE_DESCRIPTOR,
				loadingState: "without"
			}),
			descriptor: {}
		})
	);
}

const dynamicFlows: DynamicFlow[] = [
	{
		name: "data_handling.multiple-dataholders",
		scenes: [
			{
				name: "MultipleDataHolders",
				matches: isExampleDescriptor,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							region: "/CONTENT",
							component: MultipleDataHoldersView
						}
					]
				}
			}
		]
	}
];

export const MultipleDataHoldersModule: DynamicConfiguration = {
	id: "data_handling.multiple-dataholders",
	dataReducers: () => dataReducers,
	sagas: () => [initializeDataHolders],
	dataProviders: () => [SaveTodosProvider, TodosProviderListA, TodosProviderListB],
	menus: state => {
		const [activity] = ActivitySelectors.activitiesByDescriptor(EXAMPLE_DESCRIPTOR)(state);
		const selected = activity !== undefined;

		return [
			{
				id: "data_handling.multiple-dataholders",
				label: { key: "examples.data-handling.multiple-data-holders.menu" },
				selected,
				action: onClick
			}
		];
	},
	flows: dynamicFlows
};
