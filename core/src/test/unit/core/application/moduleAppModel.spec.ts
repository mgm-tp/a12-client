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

import { deepStrictEqual } from "node:assert/strict";

import type { ApplicationModel } from "../../../../core/model/index.js";
import { APPLICATION_MODEL_PLACEHOLDER } from "../../../../core/model/index.js";
import { addApplicationModels } from "../../../../core/model/internal/moduleAppModel.js";

describe("core.application", () => {
	describe("app-model.merging", () => {
		it("merges appmodels together", () => {
			const target: ApplicationModel = {
				header: {
					id: "target",
					modelType: "application",
					modelVersion: "1.0.0",
					locales: [{ code: "l1" }]
				},
				content: {
					region: {
						name: "ROOT",
						layout: { name: "layout" }
					},
					defaultRegion: ["ROOT"],
					modules: []
				}
			};

			const source1: ApplicationModel = {
				header: {
					id: "source1",
					modelType: "application",
					modelVersion: "1.0.0",
					locales: [{ code: "l2" }]
				},
				content: {
					region: {
						name: "ROOT",
						layout: { name: "layout2" }
					},
					defaultRegion: ["ROOT"],
					modules: [makeModule("source1")],
					initialActivity: {
						descriptor: { key: "source1Descriptor" }
					}
				}
			};

			const source2: ApplicationModel = {
				header: {
					id: "source2",
					modelType: "application",
					modelVersion: "1.0.0",
					locales: [{ code: "l2" }]
				},
				content: {
					region: {
						name: "ROOT",
						layout: { name: "layout2" }
					},
					defaultRegion: ["ROOT"],
					modules: [makeModule("source2")],
					initialActivity: {
						descriptor: { key: "source2Descriptor" }
					}
				}
			};

			const expected: ApplicationModel = {
				...target,
				header: {
					...target.header,
					locales: target.header.locales?.concat(source1.header.locales ?? [])
				},
				content: {
					...target.content,
					initialActivity: {
						descriptor: { key: "source1Descriptor" }
					},
					modules: [makeModule("source1"), makeModule("source2")]
				}
			};

			const result = addApplicationModels([source1, source2], target);

			deepStrictEqual(result, expected);
		});

		it("ignores target model when its the placeholder model", () => {
			const source1: ApplicationModel = {
				header: {
					id: "source1",
					modelType: "application",
					modelVersion: "1.0.0",
					locales: [{ code: "l1" }]
				},
				content: {
					region: {
						name: "ROOT",
						layout: { name: "layout2" }
					},
					defaultRegion: ["ROOT"],
					modules: [makeModule("source1")],
					initialActivity: {
						descriptor: { key: "source1Descriptor" }
					}
				}
			};

			const source2: ApplicationModel = {
				header: {
					id: "source2",
					modelType: "application",
					modelVersion: "1.0.0",
					locales: [{ code: "l2" }]
				},
				content: {
					region: {
						name: "ROOT",
						layout: { name: "layout2" }
					},
					defaultRegion: ["ROOT"],
					modules: [makeModule("source2")],
					initialActivity: {
						descriptor: { key: "source2Descriptor" }
					}
				}
			};

			const expected: ApplicationModel = {
				...source1,
				header: {
					...source1.header,
					locales: source1.header.locales?.concat(source2.header.locales ?? [])
				},
				content: {
					...source1.content,
					initialActivity: {
						descriptor: { key: "source1Descriptor" }
					},
					modules: [makeModule("source1"), makeModule("source2")]
				}
			};

			const result = addApplicationModels([source1, source2], APPLICATION_MODEL_PLACEHOLDER);

			deepStrictEqual(result, expected);
		});
	});
});

function makeModule(name: string): ApplicationModel.Module {
	return {
		name,
		flows: [],
		menu: { name }
	};
}
