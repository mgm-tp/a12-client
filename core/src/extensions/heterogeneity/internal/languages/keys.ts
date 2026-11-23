// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { initializeKeys } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/LocalizationTree.js";

/**
 * EXPERIMENTAL
 *
 * Resource keys for usage with the A12 localization API.
 *
 * Please note that adding new keys to this object is not considered as a breaking change.
 */
export const RESOURCE_KEYS = {
	variant_selection: {
		/**
		 * Label of an item in the variant selection.
		 *
		 * Available "placeholder":
		 * * `$modelId$` - ID of underlying model
		 */
		variant_label: ""
	}
};

initializeKeys(RESOURCE_KEYS);
