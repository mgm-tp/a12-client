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
	veto: {
		/**
		 * Key of the veto dialog message.
		 *
		 * Available "placeholder":
		 * * `$activityId$` - Id of the activity that is going to be canceled
		 */
		message: "",
		/** Key of the veto dialog title */
		title: "",
		/** Key of the veto dialog discard title */
		buttonDiscard: "",
		/** Key of the veto dialog abort title */
		buttonAbort: ""
	}
};

initializeKeys(RESOURCE_KEYS);
