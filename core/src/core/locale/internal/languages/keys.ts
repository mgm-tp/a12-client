// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { initializeKeys } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/LocalizationTree.js";

/**
 * Resource keys for usage with the A12 localization API.
 *
 * Please note that adding new keys to this object is not considered as a breaking change.
 */
export const RESOURCE_KEYS = {
	application: {
		/** Key of the title of the application frame */
		title: ""
	},
	dashboard: {
		/** Key of the hidden but read title of the dashboard required for a11y reasons */
		hiddenTitle: ""
	},
	error: {
		/** Key of a generic unknown error */
		unknown: ""
	}
};

initializeKeys(RESOURCE_KEYS);
