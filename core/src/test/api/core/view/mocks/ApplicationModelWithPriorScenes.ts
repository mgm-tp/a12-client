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

import type { ApplicationModel } from "../../../../../core/model/index.js";

const model: ApplicationModel = {
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
				{
					name: "CONTENT",
					layout: { name: "MasterDetail" }
				}
			]
		},
		defaultRegion: ["CONTENT"],
		modules: [
			{
				name: "Model 1: onEnter(Add), onExit()",
				menu: {
					name: "model1",
					label: [{ locale: "en", text: "Model 1" }],
					initialActivity: {
						descriptor: {
							model: "MODEL_A_NOTHING"
						}
					}
				},
				flows: [
					{
						name: "Model1Flow1",
						scenes: [
							{
								name: "1",
								matchConditions: [
									{
										key: "model",
										mustEqual: "MODEL_A_NOTHING"
									},
									{
										key: "instance",
										isSet: false
									}
								],
								sceneChange: {
									onEnter: [
										{
											type: "VIEW_ADD",
											name: "OverviewCRUD"
										}
									]
								}
							},
							{
								name: "2",
								matchConditions: [
									{
										key: "instance",
										isSet: true
									}
								],
								priorScene: "1",
								sceneChange: {
									onEnter: [
										{
											type: "VIEW_ADD",
											name: "OverviewCRUD"
										}
									]
								}
							},
							{
								name: "3",
								matchConditions: [
									{
										key: "flag",
										isSet: true
									}
								],
								priorScene: "2",
								sceneChange: {
									onEnter: [
										{
											type: "VIEW_ADD",
											name: "OverviewCRUD"
										}
									]
								}
							}
						]
					}
				]
			},
			{
				name: "Model 2: onEnter(Clr, Add), onExit()",
				menu: {
					name: "model2",
					label: [{ locale: "en", text: "Model 2" }],
					initialActivity: {
						descriptor: {
							model: "MODEL_CA_NOTHING"
						}
					}
				},
				flows: [
					{
						name: "Model2Flow1",
						scenes: [
							{
								name: "1",
								matchConditions: [
									{
										key: "model",
										mustEqual: "MODEL_CA_NOTHING"
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
											name: "OverviewCRUD"
										}
									]
								}
							},
							{
								name: "2",
								matchConditions: [
									{
										key: "instance",
										isSet: true
									}
								],
								priorScene: "1",
								sceneChange: {
									onEnter: [
										{
											type: "REGION_CLEAR"
										},
										{
											type: "VIEW_ADD",
											name: "OverviewCRUD"
										}
									]
								}
							}
						]
					}
				]
			},
			{
				name: "Model 3: onEnter(Add), onExit(Clr)",
				menu: {
					name: "model3",
					label: [{ locale: "en", text: "Model 3" }],
					initialActivity: {
						descriptor: {
							model: "MODEL_A_C"
						}
					}
				},
				flows: [
					{
						name: "Model3Flow1",
						scenes: [
							{
								name: "1",
								matchConditions: [
									{
										key: "model",
										mustEqual: "MODEL_A_C"
									},
									{
										key: "instance",
										isSet: false
									}
								],
								sceneChange: {
									onEnter: [
										{
											type: "VIEW_ADD",
											name: "OverviewCRUD"
										}
									],
									onExit: [
										{
											type: "REGION_CLEAR"
										}
									]
								}
							},
							{
								name: "2",
								matchConditions: [
									{
										key: "instance",
										isSet: true
									}
								],
								priorScene: "1",
								sceneChange: {
									onEnter: [
										{
											type: "VIEW_ADD",
											name: "OverviewCRUD"
										}
									],
									onExit: [
										{
											type: "REGION_CLEAR"
										}
									]
								}
							}
						]
					}
				]
			},
			{
				name: "Model 4: onEnter(Clr, Add), onExit(Clr)",
				menu: {
					name: "model4",
					label: [{ locale: "en", text: "Model 4" }],
					initialActivity: {
						descriptor: {
							model: "MODEL_CA_C"
						}
					}
				},
				flows: [
					{
						name: "Model4Flow1",
						scenes: [
							{
								name: "1",
								matchConditions: [
									{
										key: "model",
										mustEqual: "MODEL_CA_C"
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
											name: "OverviewCRUD"
										}
									],
									onExit: [
										{
											type: "REGION_CLEAR"
										}
									]
								}
							},
							{
								name: "2",
								matchConditions: [
									{
										key: "instance",
										isSet: true
									}
								],
								priorScene: "1",
								sceneChange: {
									onEnter: [
										{
											type: "VIEW_ADD",
											name: "OverviewCRUD"
										}
									],
									onExit: [
										{
											type: "REGION_CLEAR"
										}
									]
								}
							},
							{
								name: "3",
								matchConditions: [
									{
										key: "flag",
										isSet: true
									}
								],
								priorScene: "2",
								sceneChange: {
									onEnter: [
										{
											type: "VIEW_ADD",
											name: "OverviewCRUD"
										}
									]
								}
							}
						]
					}
				]
			},
			{
				name: "Model 5: No matching container",
				menu: {
					name: "model5",
					label: [{ locale: "en", text: "Model 5" }],
					initialActivity: {
						descriptor: {
							model: "MODEL_NO_CONTAINER"
						}
					}
				},
				flows: [
					{
						name: "Model5Flow1",
						scenes: [
							{
								name: "1",
								matchConditions: [
									{
										key: "model",
										mustEqual: "MODEL_NO_CONTAINER"
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
											name: "OverviewCRUD"
										}
									],
									onExit: [
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

export default model;
