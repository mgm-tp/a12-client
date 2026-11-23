// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
