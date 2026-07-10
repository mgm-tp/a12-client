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

import { withErrorBoundary } from "../../../utils/withErrorBoundary.js";
import { withProgressIndicator } from "../../../utils/withProgressIndicator.js";

import { ErrorBoundaries } from "./ErrorBoundaries.js";

function EngineWithError(): JSX.Element {
	throw new Error(
		"I crash when someone tries to render me. :( But I am helpful to demonstrate the use of error boundaries."
	);
}

const INITIAL_DESCRIPTOR = { section: "ErrorHandling", feature: "ErrorBoundaries" };

function matchesErrorBoundaries(d: Activity.Descriptor): boolean {
	return d.section === "ErrorHandling" && d.feature === "ErrorBoundaries";
}

function matchesEngineWithError(d: Activity.Descriptor): boolean {
	return d.feature === "EngineWithError" && d.model === "Book-document" && !d.instance;
}

const dynamicFlows: DynamicFlow[] = [
	{
		name: "error_handling.error-boundaries",
		scenes: [
			{
				name: "ErrorBoundaries",
				matches: matchesErrorBoundaries,
				sceneChange: {
					onEnter: [
						{ type: "DYNAMIC_CLEAR_REGION", region: "/CONTENT" },
						{
							type: "DYNAMIC_ADD_VIEW",
							component: withProgressIndicator(ErrorBoundaries),
							region: "/CONTENT"
						}
					]
				}
			},
			{
				name: "EngineWithError",
				priorScene: "ErrorBoundaries",
				matches: matchesEngineWithError,
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: withErrorBoundary(withProgressIndicator(EngineWithError)),
							region: "/CONTENT",
							models: [{ modelType: "document", name: "Book-document" }]
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
			id: "error_handling.error-boundaries",
			label: {
				key: "error_handling.error-boundaries",
				defaults: { en: "Error Boundaries", de: "Error Boundaries" }
			},
			action: onMenuClick,
			selected: activities.at(0) !== undefined
		}
	];
}

export const ErrorBoundariesModule: DynamicConfiguration = {
	id: "error_handling.error-boundaries",
	flows: dynamicFlows,
	menus: selectMenus
};
