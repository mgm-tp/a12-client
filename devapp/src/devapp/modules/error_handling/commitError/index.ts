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

import { CommitErrorHandling } from "./commitError.js";
import { commitErrorDataLoader } from "./commitErrorDataLoader.js";
import { CommitErrorHandlingFeature } from "./commitErrorFeature.js";
import { commitErrorHandlingSaga } from "./commitErrorHandlingSaga.js";

const INITIAL_DESCRIPTOR = { section: "ErrorHandling", feature: "CommitErrorHandling" };

function matchesFeature(d: Activity.Descriptor): boolean {
	return d.section === "ErrorHandling" && d.feature === "CommitErrorHandling" && !d.instance;
}

function matchesHandling(d: Activity.Descriptor): boolean {
	return d.section === "ErrorHandling" && d.feature === "CommitErrorHandling" && !!d.instance;
}

const dynamicFlows: DynamicFlow[] = [
	{
		name: "error_handling.commit-error",
		scenes: [
			{
				name: "CommitErrorHandlingFeature",
				matches: matchesFeature,
				sceneChange: {
					onEnter: [
						{ type: "DYNAMIC_CLEAR_REGION", region: "/CONTENT" },
						{
							type: "DYNAMIC_ADD_VIEW",
							component: withProgressIndicator(CommitErrorHandlingFeature),
							region: "/CONTENT"
						}
					]
				}
			},
			{
				name: "CommitErrorHandling",
				matches: matchesHandling,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: withProgressIndicator(CommitErrorHandling),
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
			id: "error_handling.commit-error",
			label: {
				key: "error_handling.commit-error",
				defaults: { en: "Commit Error Handling", de: "Commit Fehlerbehandlung" }
			},
			action: onMenuClick,
			selected: activities.at(0) !== undefined
		}
	];
}

export const CommitErrorModule: SampleAppModule = {
	dataLoaders: [commitErrorDataLoader],
	id: "error_handling.commit-error",
	flows: dynamicFlows,
	menus: selectMenus,
	sagas: () => [commitErrorHandlingSaga]
};
