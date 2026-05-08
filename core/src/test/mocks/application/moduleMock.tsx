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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import type { JSX } from "react";

import type { Module } from "../../../core/application/index.js";
import type { ApplicationModel } from "../../../core/model/index.js";

function ModuleComponent(): JSX.Element {
	return <div>ModuleComponent</div>;
}

interface Params extends Partial<Module> {
	readonly id: string;
}

export function createModuleMock(params: Params): Module {
	return {
		views: () => componentName => ModuleComponent,
		reducersMap: () => ({}),
		dataReducers: () => [],
		middlewares: () => [],
		sagas: () => [],
		dataProviders: () => [],
		...params
	};
}

export const module1Mock = createModuleMock({ id: "module_1" });
export const module2Mock = createModuleMock({ id: "module_2" });

export const moduleModel: ApplicationModel = {
	header: {
		id: "DynamicConfiguration",
		modelType: "application",
		modelVersion: "1.0.0"
	},
	content: {
		region: { name: "ROOT", layout: { name: "MockLayout" } },
		defaultRegion: ["ROOT"],
		modules: [
			{
				name: "DynamicConfiguration",
				menu: {
					name: "Module2Menu",
					initialActivity: {
						descriptor: {
							page: "module_2_page"
						}
					}
				},
				flows: [
					{
						name: "Module2Flow",
						scenes: [
							{
								name: "Module2Scene",
								matchConditions: [
									{
										key: "page",
										mustEqual: "module_2_page"
									}
								],
								sceneChange: {
									onEnter: [
										{
											type: "REGION_CLEAR"
										}
									]
								}
							}
						]
					}
				]
			}
		]
	}
};
