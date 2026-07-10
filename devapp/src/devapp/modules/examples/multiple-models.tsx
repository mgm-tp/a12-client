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
	DynamicMenu,
	ViewNGProps
} from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	ApplicationActions
} from "@com.mgmtp.a12.client/client-core";
import { ActionContentbox, ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core";

const INITIAL_DESCRIPTOR = {
	section: "Examples",
	example: "MultipleModels",
	model: "Book-document"
};

function matchesScene(d: Activity.Descriptor): boolean {
	return d.section === "Examples" && d.example === "MultipleModels";
}

function MultipleModelsFeature(props: ViewNGProps) {
	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title
					text="Load additional document models"
					ariaLevel={props.ariaLevel}
				/>
			}
		>
			<h3>Scene with four document models</h3>
			<p>
				This example demonstrates how to load additional document models into the Redux store by
				declaring them in the dynamic config.
			</p>
			<pre>{MODELS}</pre>
			<p>
				We want to load several document models into the Redux store whenever a scene gets entered.
				These additional document models could be used for some application specific pre- or
				post-processing. Have a look at the models slice in the store to see that the declared
				models have been loaded.
			</p>
			<br />
			<p>
				<b>Note:</b> The activity descriptor must contain model and instance properties, because the
				loading of models is only done along with data loading. If the given instance is not
				available, an exception might be thrown, but the models are loaded anyway.
			</p>
		</ActionContentbox>
	);
}

const MODELS = `sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: MultipleModelsFeature,
							region: "/CONTENT",
							models: [
								{ modelType: "document", name: "Book-document" },
								{ modelType: "document", name: "BookAuthor-document" }
							]
						}
					]
				}`;

const dynamicFlows: DynamicFlow[] = [
	{
		name: "examples.multiple-models.flow",
		scenes: [
			{
				name: "MultipleModelsScene",
				matches: matchesScene,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: MultipleModelsFeature,
							region: "/CONTENT",
							models: [
								{ modelType: "document", name: "Book-document" },
								{ modelType: "document", name: "BookAuthor-document" }
							]
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
			id: "examples.multiple-models",
			label: {
				key: "examples.multiple-models",
				defaults: { en: "Multiple Models", de: "Zusätzliche Modelle" }
			},
			action: onMenuClick,
			selected: activities.at(0) !== undefined
		}
	];
}

export const MultipleModelsModule: DynamicConfiguration = {
	id: "examples.multiple-models",
	flows: dynamicFlows,
	menus: selectMenus
};
