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

import type { ComponentType } from "react";
import type { Middleware } from "redux";

import {
	APPLICATION_MODEL_PLACEHOLDER,
	ApplicationActions,
	combineFeatures,
	ModelActions,
	ModuleRegistryProvider,
	withDynamicConfig,
	withModel,
	type A12ApplicationConfig,
	type DynamicConfiguration,
	type DynamicMatchCondition,
	type ViewNGProps
} from "@com.mgmtp.a12.client/client-core";

declare const initialConfig: A12ApplicationConfig;

// tag::step1[]
export const finalConfig = combineFeatures(
	withModel(APPLICATION_MODEL_PLACEHOLDER),
	withDynamicConfig()
	// ... other features
)(initialConfig);
// end::step1[]

// tag::step3a[]
const matchesPersonOverview: DynamicMatchCondition = descriptor =>
	descriptor.feature === "person" && !descriptor.instance;
declare const PersonOverview: ComponentType<ViewNGProps>;
// end::step3a[]

const PersonConfiguration: DynamicConfiguration = {
	id: "Person",
	flows() {
		return [
			{
				name: "person.flow",
				scenes: [
					// tag::step3b[]

					// inside the scenes array...
					{
						name: "person.overview",
						// JSON: "matchConditions": [
						// 	{ "key": "feature", "mustEqual": "person" },
						// 	{ "key": "instance", "isSet": false }
						// ]
						matches: matchesPersonOverview,
						sceneChange: {
							onEnter: [
								{
									// JSON: { "type": "VIEW_ADD", "name": "PersonOverview", "models": [...] }
									type: "DYNAMIC_ADD_VIEW",
									region: "/CONTENT",
									component: PersonOverview,
									models: [
										/* ... */
									]
								}
							]
						}
					},
					// end::step3b[]
					// tag::bad[]
					{
						name: "bad",
						matches: () => true, // new function on every state change!
						sceneChange: {
							onEnter: [
								{
									type: "DYNAMIC_ADD_VIEW",
									region: "/CONTENT",
									// new component on every state change!
									component: (props: ViewNGProps) => <div>{props.activityId}</div>
								}
							]
						}
					}
					// end::bad[]
				]
			}
		];
	},
	// tag::step4[]
	menus() {
		// JSON: "label": [{ "locale": "en", "text": "Person" }], "initialActivity": { "descriptor": { "feature": "person" } }
		return [
			{
				id: "person-menu",
				label: { key: "application.menu.person" },
				action: dispatch =>
					dispatch(
						ApplicationActions.startMainActivityRequested({ descriptor: { feature: "person" } })
					)
			}
		];
	}
	// end::step4[]
};

// tag::step5[]
export const initializationMiddleware: Middleware = () => next => action => {
	const result = next(action);
	if (ModelActions.setModelGraph.match(action) && location.hash.replace(/^#/, "") === "") {
		location.hash = "feature:person";
	}
	return result;
};
// end::step5[]

// tag::step6[]
ModuleRegistryProvider.getInstance().addModule(PersonConfiguration);
// end::step6[]
