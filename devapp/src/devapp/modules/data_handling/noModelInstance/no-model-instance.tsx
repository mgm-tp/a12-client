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

import type { JSX } from "react";
import { useSelector } from "react-redux";
import type { Dispatch } from "redux";

import type {
	Activity,
	DataLoader,
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

import type { SampleAppModule } from "../../../utils/SampleAppModule.js";
import { withProgressIndicator } from "../../../utils/withProgressIndicator.js";

class NoModelInstanceDataLoader implements DataLoader<{}> {
	name = "NoModelInstanceDataLoader";

	load() {
		return new Promise<{}>(resolve => {
			setTimeout(() => {
				resolve({ document: "some custom data" });
			}, 2000);
		});
	}

	save() {
		return Promise.reject("Save operation not supported.");
	}

	delete() {
		return Promise.reject("Delete operation not supported.");
	}

	canHandle(descriptor: Activity.Descriptor): boolean {
		return descriptor.feature === "NoModelInstanceDescriptor";
	}
}

const INITIAL_DESCRIPTOR = { section: "DataHandling", feature: "NoModelInstanceDescriptor" };

function matchesNoModelInstance(descriptor: Activity.Descriptor): boolean {
	return (
		descriptor.section === "DataHandling" && descriptor.feature === "NoModelInstanceDescriptor"
	);
}

const dynamicFlows: DynamicFlow[] = [
	{
		name: "data_handling.no-model-instance",
		scenes: [
			{
				name: "NoModelInstanceDescriptor",
				matches: matchesNoModelInstance,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: withProgressIndicator(NoModelInstanceView),
							region: "/CONTENT",
							models: [{ modelType: "document", name: "CRUD-document" }]
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
			id: "data_handling.no-model-instance",
			label: {
				key: "data_handling.no-model-instance",
				defaults: {
					en: "No model/instance descriptor",
					de: "Kein model/instance descriptor"
				}
			},
			action: onMenuClick,
			selected: activities.at(0) !== undefined
		}
	];
}

export const NoModelInstanceModule: SampleAppModule = {
	id: "data_handling.no-model-instance",
	dataLoaders: [new NoModelInstanceDataLoader()],
	flows: dynamicFlows,
	menus: selectMenus
};

function NoModelInstanceView(props: ViewNGProps): JSX.Element | null {
	const data = useSelector(ActivitySelectors.data(props.activityId));

	const loaded = useSelector(ActivitySelectors.loadingStateById(props.activityId)) === "loaded";

	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title
					text="Data loading without model/instance"
					ariaLevel={props.ariaLevel}
				/>
			}
		>
			<p>
				This example shows how to load data without specifying the model/instance properties in the
				Activity.Descriptor.
			</p>
			<br />
			<br />
			{loaded && <>Loaded data: {JSON.stringify(data)}</>}
		</ActionContentbox>
	);
}
