// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ApplicationModel } from "./ApplicationModel.js";

/**
 * @experimental
 *
 * Placeholder value for an empty appmodel that can be passed in the application setup when
 * the adapter module is used.
 *
 * Will be replaced with the first appmodel that is provided by the adapter.
 */
export const APPLICATION_MODEL_PLACEHOLDER: ApplicationModel = {
	header: { id: "APPLICATION_MODEL_PLACEHOLDER", modelType: "application", modelVersion: "6.0.0" },
	content: {
		modules: [],
		region: {
			name: "APPLICATION_MODEL_PLACEHOLDER_REGION",
			layout: { name: "Null" },
			subRegions: [
				{
					name: "CONTENT",
					layout: {
						name: "MasterDetail"
					}
				},
				{
					name: "SIDEBAR",
					layout: {
						name: "Null"
					}
				},
				{
					name: "MODAL",
					layout: {
						name: "Stack"
					}
				}
			]
		},
		defaultRegion: []
	}
};
