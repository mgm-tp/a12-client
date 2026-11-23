// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
