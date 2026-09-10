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

import type { ApplicationModel } from "../../../core/model/index.js";
import {
	createAppModel,
	createContent,
	createModule,
	createRegion,
	createScene,
	createSubRegions
} from "../../utils/appmodel-utils.js";

export const modelForModalRegion: ApplicationModel = createAppModel({
	content: createContent({
		region: createRegion({
			subRegions: createSubRegions()
		}),
		modules: [
			createModule({
				flows: [
					{
						name: "FeatureFlow1",
						scenes: [
							createScene({
								matchConditions: [
									{ key: "feature", mustEqual: "views" },
									{ key: "instance", isSet: false }
								],
								cases: [
									{
										name: "modalRegion",
										label: [{ locale: "en", text: "Modal Region" }],
										sceneChange: {
											onEnter: [
												{ type: "REGION_CLEAR" },
												{
													type: "VIEW_ADD",
													name: "ModalRegion"
												}
											]
										}
									}
								]
							}),
							{
								name: "ModalRegion",
								description: "Modal Region",
								matchConditions: [{ key: "page", mustEqual: "ModalRegion" }],
								sceneChange: {
									onEnter: [
										{
											type: "VIEW_ADD",
											name: "ModalRegion",
											region: ["MODAL"]
										}
									]
								}
							}
						]
					}
				]
			})
		]
	})
});

export const modelForApplicationFrame: ApplicationModel = createAppModel({
	content: createContent({
		region: createRegion({ subRegions: createSubRegions(true) }),
		modules: [
			createModule({
				name: "Feature Module",
				flows: [
					{
						name: "FeatureFlow1",
						scenes: [
							createScene({
								matchConditions: [
									{ key: "feature", mustEqual: "views" },
									{ key: "instance", isSet: false }
								],
								onEnterDirectives: [
									{
										type: "VIEW_ADD",
										region: ["SIDEBAR"],
										name: "GenericCaseMenu"
									}
								],
								cases: [
									{
										name: "modalRegion",
										label: [{ locale: "en", text: "Modal Region" }],
										sceneChange: {
											onEnter: [
												{
													type: "REGION_CLEAR"
												},
												{
													type: "VIEW_ADD",
													name: "ModalRegion"
												}
											]
										}
									}
								]
							}),
							createScene({
								matchConditions: [{ key: "page", mustEqual: "ModalRegion" }],
								onEnterDirectives: [
									{
										type: "VIEW_ADD",
										name: "ModalRegion",
										region: ["MODAL"]
									}
								]
							})
						]
					}
				]
			})
		]
	})
});

export const modelForMainMenu: ApplicationModel = createAppModel({
	content: createContent({
		region: createRegion({ subRegions: createSubRegions() }),
		modules: [
			createModule({
				name: "View1",
				menu: {
					name: "1",
					label: [
						{ locale: "en", text: "View 1" },
						{ locale: "de", text: "Ansicht 1" }
					],
					initialActivity: { descriptor: { model: "View1-model" } }
				}
			}),
			createModule({
				name: "View2",
				menu: {
					name: "2",
					label: [
						{ locale: "en", text: "View 2" },
						{ locale: "de", text: "Ansicht 2" }
					],
					initialActivity: { descriptor: { model: "View2-model" } }
				}
			}),
			createModule({
				name: "View3",
				menu: {
					name: "3",
					label: [
						{ locale: "en", text: "View 3" },
						{ locale: "de", text: "Ansicht 3" }
					],
					initialActivity: { descriptor: { model: "View3-model" } },

					permission: "VIEW_USER_1"
				}
			}),
			createModule({
				name: "View4",
				menu: {
					name: "4",
					label: [
						{ locale: "en", text: "View 4" },
						{ locale: "de", text: "Ansicht 4" }
					],
					initialActivity: { descriptor: { model: "View4-model" } },

					permission: "VIEW_USER_2"
				}
			})
		]
	})
});

export const modelWithSubRegions: ApplicationModel = createAppModel({
	content: createContent({
		region: createRegion({ subRegions: createSubRegions() }),
		modules: [
			createModule({
				flows: [
					{
						name: "flow1",
						scenes: [
							{
								name: "scene1",
								matchConditions: []
							}
						]
					}
				]
			})
		]
	})
});

export const modelWithOutSubRegions: ApplicationModel = createAppModel({
	content: createContent({
		region: createRegion({ subRegions: [] }),
		defaultRegion: []
	})
});

export const modelWithSubRegionsAndMockLayout: ApplicationModel = createAppModel({
	content: createContent({
		region: createRegion({
			layout: { name: "ApplicationFrameMock" },
			subRegions: createSubRegions(true)
		})
	})
});

export const dashboardSettingsMock: ApplicationModel.Dashboard.Settings = {
	rows: [
		{
			columns: [
				{
					width: { sm: 2, md: 3, lg: 6 }
				},
				{
					width: { sm: 2, md: 3, lg: 6 }
				}
			]
		}
	]
};

export const modelForErrorBoundaries: ApplicationModel = createAppModel({
	content: createContent({
		region: {
			name: "dummy",
			layout: { name: "dummy" }
		},
		defaultRegion: ["dummy"]
	})
});

export const modelViewsInSubRegions: ApplicationModel = createAppModel({
	content: createContent({
		region: createRegion({ subRegions: createSubRegions() }),
		modules: [
			createModule({
				menu: {
					name: "Feature Module",
					initialActivity: { descriptor: {} }
				},
				flows: [
					{
						name: "FeatureFlow1",
						scenes: [
							createScene({
								matchConditions: [
									{ key: "feature", mustEqual: "views" },
									{ key: "instance", isSet: false }
								],
								onEnterDirectives: [
									{
										type: "VIEW_ADD",
										name: "ViewA"
									},
									{
										type: "VIEW_ADD",
										name: "ViewB",
										region: ["SIDEBAR"]
									},
									{
										type: "VIEW_ADD",
										name: "ViewC",
										region: ["MODAL"]
									}
								]
							})
						]
					}
				]
			})
		]
	})
});

export const modelForSidebar: ApplicationModel = createAppModel({
	content: createContent({
		region: createRegion({ subRegions: createSubRegions(true) }),
		modules: [
			createModule({
				name: "Module with normal sidebar",
				flows: [
					{
						name: "FeatureFlow1",
						scenes: [
							createScene({
								matchConditions: [
									{ key: "feature", mustEqual: "views" },
									{ key: "page", mustEqual: "normal-sidebar" }
								],
								onEnterDirectives: [
									{
										type: "VIEW_ADD",
										region: ["SIDEBAR"],
										name: "GenericCaseMenu"
									}
								]
							})
						]
					}
				]
			}),
			createModule({
				name: "Module with enhanced sidebar",
				flows: [
					{
						name: "FeatureFlow2",
						scenes: [
							createScene({
								matchConditions: [
									{ key: "feature", mustEqual: "views" },
									{ key: "page", mustEqual: "extended-sidebar" }
								],
								onEnterDirectives: [
									{
										type: "VIEW_ADD",
										region: ["SIDEBAR"],
										name: "GenericCaseMenu"
									},
									{
										type: "VIEW_ADD",
										region: ["SIDEBAR"],
										name: "Placeholder"
									}
								]
							})
						]
					}
				]
			})
		]
	})
});
