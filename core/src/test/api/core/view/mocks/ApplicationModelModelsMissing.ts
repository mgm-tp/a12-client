// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationModel } from "../../../../../core/model/index.js";

export const model: ApplicationModel = {
	header: {
		id: "COSMO_A12",
		modelType: "application",
		modelVersion: "1.0.0",
		locales: [{ code: "en" }]
	},
	content: {
		region: {
			name: "APP",
			layout: { name: "ApplicationFrame" },
			subRegions: [
				{ name: "CONTENT", layout: { name: "MasterDetail" } },
				{ name: "SIDEBAR", layout: { name: "Null" } },
				{ name: "MODAL", layout: { name: "Stack" } }
			]
		},
		defaultRegion: ["CONTENT"],
		modules: [
			{
				name: "FormEngineAdapterTest Module",
				menu: {
					name: "form-engine-adapter-test",
					label: [{ locale: "en", text: "FormEngineAdapterTest" }],
					initialActivity: {
						descriptor: {
							model: "FormEngineAdapterTest"
						}
					}
				},
				flows: [
					{
						name: "FormEngineAdapterTestFlow1",
						scenes: [
							{
								name: "FormEngineAdapterTestOverview",
								description: "Overview of FormEngineAdapterTest",
								matchConditions: [
									{
										key: "model",
										mustEqual: "FormEngineAdapterTest"
									},
									{
										key: "instance",
										isSet: false
									}
								],
								sceneChange: {
									onEnter: [
										{
											type: "REGION_CLEAR"
										},
										{
											type: "VIEW_ADD",
											name: "OverviewCRUD",
											models: [
												{
													modelType: "overview",
													name: "FormEngineAdapterTest-overview"
												}
											]
										}
									]
								}
							},
							{
								name: "FormEngineAdapterTestForm",
								description: "Specific Form of FormEngineAdapterTest",
								matchConditions: [
									{
										key: "instance",
										isSet: true
									}
								],
								priorScene: "FormEngineAdapterTestOverview",
								sceneChange: {
									onEnter: [
										{
											type: "VIEW_ADD",
											name: "FormCRUD",
											models: [{ modelType: "form", name: "Missing" }]
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
